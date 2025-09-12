from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import jwt
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
import uuid
import asyncio
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'civic-pulse-secret-key-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DELTA = timedelta(days=7)

# Security
security = HTTPBearer()

# LLM Integration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, is_admin: bool = False):
        await websocket.accept()
        if is_admin:
            self.admin_connections.append(websocket)
        else:
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, is_admin: bool = False):
        if is_admin and websocket in self.admin_connections:
            self.admin_connections.remove(websocket)
        elif websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_to_admins(self, message: str):
        for connection in self.admin_connections:
            try:
                await connection.send_text(message)
            except:
                await self.disconnect(connection, is_admin=True)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

# Create the main app
app = FastAPI(title="CivicPulse - Citizen Feedback System", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserRole(str):
    CITIZEN = "citizen"
    OFFICER = "officer"
    DEPT_HEAD = "dept_head"
    ADMIN = "admin"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = UserRole.CITIZEN
    department: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = UserRole.CITIZEN
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class FeedbackStatus(str):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class FeedbackCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    department: str
    icon: str
    color: str
    is_active: bool = True

class FeedbackPriority(str):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Location(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None

class MediaFile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_type: str
    file_size: int
    url: str

class Feedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category_id: str
    status: str = FeedbackStatus.PENDING
    priority: str = FeedbackPriority.MEDIUM
    ai_urgency_score: Optional[float] = None
    ai_sentiment: Optional[str] = None
    
    # User information
    user_id: Optional[str] = None  # None for anonymous feedback
    is_anonymous: bool = False
    contact_info: Optional[Dict[str, Any]] = None  # For anonymous users
    
    # Location
    location: Optional[Location] = None
    
    # Media
    media_files: List[MediaFile] = []
    
    # Assignment
    assigned_to: Optional[str] = None
    assigned_at: Optional[datetime] = None
    department: Optional[str] = None
    
    # Tracking
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None
    
    # Resolution
    resolution_notes: Optional[str] = None
    resolution_media: List[MediaFile] = []
    citizen_rating: Optional[int] = None
    citizen_feedback_text: Optional[str] = None

class FeedbackCreate(BaseModel):
    title: str
    description: str
    category_id: str
    priority: str = FeedbackPriority.MEDIUM
    is_anonymous: bool = False
    contact_info: Optional[Dict[str, Any]] = None
    location: Optional[Location] = None

class FeedbackUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    department: Optional[str] = None
    resolution_notes: Optional[str] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    feedback_id: str
    sender_id: str
    sender_type: str  # "citizen" or "officer"
    message: str
    media_files: List[MediaFile] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = False

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: str
    old_data: Optional[Dict[str, Any]] = None
    new_data: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Utility Functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + JWT_EXPIRATION_DELTA
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

async def analyze_feedback_with_ai(title: str, description: str) -> Dict[str, Any]:
    """Use AI to analyze feedback urgency and sentiment"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"feedback-analysis-{str(uuid.uuid4())}",
            system_message="You are an AI assistant that analyzes citizen feedback for government services. Analyze the urgency level (0.0 to 1.0) and sentiment (positive/neutral/negative/urgent) of the feedback."
        ).with_model("openai", "gpt-4o-mini")
        
        analysis_request = f"""
        Analyze this citizen feedback:
        Title: {title}
        Description: {description}
        
        Please respond with ONLY a JSON object in this exact format:
        {{"urgency_score": 0.85, "sentiment": "urgent", "reasoning": "Brief explanation"}}
        
        Urgency score: 0.0 (low) to 1.0 (critical emergency)
        Sentiment: positive, neutral, negative, or urgent
        """
        
        user_message = UserMessage(text=analysis_request)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            result = json.loads(response.strip())
            return {
                "urgency_score": float(result.get("urgency_score", 0.5)),
                "sentiment": result.get("sentiment", "neutral"),
                "ai_reasoning": result.get("reasoning", "")
            }
        except json.JSONDecodeError:
            # Fallback if AI doesn't return valid JSON
            urgency = 0.7 if any(word in (title + " " + description).lower() 
                               for word in ["urgent", "emergency", "critical", "dangerous", "broken", "flood"]) else 0.3
            return {
                "urgency_score": urgency,
                "sentiment": "urgent" if urgency > 0.6 else "neutral",
                "ai_reasoning": "Keyword-based analysis"
            }
    except Exception as e:
        logging.error(f"AI analysis failed: {e}")
        return {
            "urgency_score": 0.5,
            "sentiment": "neutral",
            "ai_reasoning": "AI analysis unavailable"
        }

async def log_action(user_id: Optional[str], action: str, resource_type: str, resource_id: str, 
                    old_data: Optional[Dict] = None, new_data: Optional[Dict] = None):
    """Log user actions for audit trail"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        old_data=old_data,
        new_data=new_data
    )
    await db.audit_logs.insert_one(audit_log.dict())

# API Routes

# Authentication
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = User(**user_data.dict(exclude={"password"}))
    user_dict = user.dict()
    user_dict['password'] = hashed_password
    
    await db.users.insert_one(user_dict)
    await log_action(user.id, "CREATE", "user", user.id, new_data=user.dict())
    
    # Create token
    token = create_access_token(user.id, user.email, user.role)
    
    return {
        "user": user.dict(),
        "access_token": token,
        "token_type": "bearer"
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    # Find user
    user_data = await db.users.find_one({"email": login_data.email})
    if not user_data or not verify_password(login_data.password, user_data['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**{k: v for k, v in user_data.items() if k != 'password'})
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    # Create token
    token = create_access_token(user.id, user.email, user.role)
    
    await log_action(user.id, "LOGIN", "user", user.id)
    
    return {
        "user": user.dict(),
        "access_token": token,
        "token_type": "bearer"
    }

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Categories
@api_router.get("/categories", response_model=List[FeedbackCategory])
async def get_categories():
    categories_data = await db.categories.find({"is_active": True}).to_list(100)
    return [FeedbackCategory(**cat) for cat in categories_data]

@api_router.post("/categories", response_model=FeedbackCategory)
async def create_category(
    category_data: FeedbackCategory,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.DEPT_HEAD]))
):
    await db.categories.insert_one(category_data.dict())
    await log_action(current_user.id, "CREATE", "category", category_data.id, new_data=category_data.dict())
    return category_data

# Feedback Management
@api_router.post("/feedback", response_model=Feedback)
async def create_feedback(feedback_data: FeedbackCreate):
    # Get category to determine department
    category = await db.categories.find_one({"id": feedback_data.category_id})
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    # Create feedback object
    feedback = Feedback(**feedback_data.dict())
    feedback.user_id = None  # Will be set later if authenticated
    feedback.department = category.get('department')
    
    # AI Analysis
    ai_analysis = await analyze_feedback_with_ai(feedback.title, feedback.description)
    feedback.ai_urgency_score = ai_analysis["urgency_score"]
    feedback.ai_sentiment = ai_analysis["sentiment"]
    
    # Auto-assign priority based on AI urgency
    if feedback.ai_urgency_score >= 0.8:
        feedback.priority = FeedbackPriority.URGENT
    elif feedback.ai_urgency_score >= 0.6:
        feedback.priority = FeedbackPriority.HIGH
    elif feedback.ai_urgency_score >= 0.4:
        feedback.priority = FeedbackPriority.MEDIUM
    else:
        feedback.priority = FeedbackPriority.LOW
    
    await db.feedback.insert_one(feedback.dict())
    await log_action(
        feedback.user_id, 
        "CREATE", 
        "feedback", 
        feedback.id, 
        new_data=feedback.dict()
    )
    
    # Broadcast to admin dashboard
    await manager.broadcast_to_admins(json.dumps({
        "type": "new_feedback",
        "data": feedback.dict()
    }))
    
    return feedback

@api_router.get("/feedback", response_model=List[Feedback])
async def get_feedback(
    status: Optional[str] = None,
    category_id: Optional[str] = None,
    department: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    # Build filter
    filter_dict = {}
    
    if current_user.role == UserRole.CITIZEN:
        filter_dict["user_id"] = current_user.id
    elif current_user.role == UserRole.OFFICER and current_user.department:
        filter_dict["department"] = current_user.department
    
    if status:
        filter_dict["status"] = status
    if category_id:
        filter_dict["category_id"] = category_id
    if department and current_user.role in [UserRole.ADMIN, UserRole.DEPT_HEAD]:
        filter_dict["department"] = department
    if priority:
        filter_dict["priority"] = priority
    
    feedback_data = await db.feedback.find(filter_dict).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    return [Feedback(**f) for f in feedback_data]

@api_router.get("/feedback/{feedback_id}", response_model=Feedback)
async def get_feedback_by_id(
    feedback_id: str,
    current_user: User = Depends(get_current_user)
):
    feedback_data = await db.feedback.find_one({"id": feedback_id})
    if not feedback_data:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback = Feedback(**feedback_data)
    
    # Check permissions
    if (current_user.role == UserRole.CITIZEN and 
        feedback.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    elif (current_user.role == UserRole.OFFICER and 
          feedback.department != current_user.department):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return feedback

@api_router.put("/feedback/{feedback_id}", response_model=Feedback)
async def update_feedback(
    feedback_id: str,
    update_data: FeedbackUpdate,
    current_user: User = Depends(require_role([UserRole.OFFICER, UserRole.DEPT_HEAD, UserRole.ADMIN]))
):
    # Get existing feedback
    existing_feedback = await db.feedback.find_one({"id": feedback_id})
    if not existing_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Check permissions
    if (current_user.role == UserRole.OFFICER and 
        existing_feedback.get("department") != current_user.department):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Prepare update
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    if update_data.status == FeedbackStatus.RESOLVED:
        update_dict["resolved_at"] = datetime.now(timezone.utc)
    
    if update_data.assigned_to:
        update_dict["assigned_at"] = datetime.now(timezone.utc)
    
    # Update feedback
    await db.feedback.update_one({"id": feedback_id}, {"$set": update_dict})
    
    # Get updated feedback
    updated_feedback_data = await db.feedback.find_one({"id": feedback_id})
    updated_feedback = Feedback(**updated_feedback_data)
    
    await log_action(
        current_user.id, 
        "UPDATE", 
        "feedback", 
        feedback_id, 
        old_data=existing_feedback,
        new_data=updated_feedback.dict()
    )
    
    # Broadcast update to admin dashboard
    await manager.broadcast_to_admins(json.dumps({
        "type": "feedback_updated",
        "data": updated_feedback.dict()
    }))
    
    return updated_feedback

# Dashboard & Analytics
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_role([UserRole.OFFICER, UserRole.DEPT_HEAD, UserRole.ADMIN]))
):
    # Build filter based on user role
    filter_dict = {}
    if current_user.role == UserRole.OFFICER and current_user.department:
        filter_dict["department"] = current_user.department
        
    # Get statistics
    total_feedback = await db.feedback.count_documents(filter_dict)
    pending_feedback = await db.feedback.count_documents({**filter_dict, "status": FeedbackStatus.PENDING})
    in_progress_feedback = await db.feedback.count_documents({**filter_dict, "status": FeedbackStatus.IN_PROGRESS})
    resolved_feedback = await db.feedback.count_documents({**filter_dict, "status": FeedbackStatus.RESOLVED})
    
    # Priority distribution
    urgent_feedback = await db.feedback.count_documents({**filter_dict, "priority": FeedbackPriority.URGENT})
    high_feedback = await db.feedback.count_documents({**filter_dict, "priority": FeedbackPriority.HIGH})
    
    # Recent feedback trend (last 7 days)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_feedback = await db.feedback.count_documents({
        **filter_dict,
        "created_at": {"$gte": week_ago}
    })
    
    return {
        "total_feedback": total_feedback,
        "pending_feedback": pending_feedback,
        "in_progress_feedback": in_progress_feedback,
        "resolved_feedback": resolved_feedback,
        "urgent_feedback": urgent_feedback,
        "high_priority_feedback": high_feedback,
        "recent_feedback_week": recent_feedback,
        "resolution_rate": round((resolved_feedback / total_feedback * 100) if total_feedback > 0 else 0, 2)
    }

# Public Dashboard (for transparency)
@api_router.get("/public/stats")
async def get_public_stats():
    """Public statistics for transparency dashboard"""
    total_feedback = await db.feedback.count_documents({})
    resolved_feedback = await db.feedback.count_documents({"status": FeedbackStatus.RESOLVED})
    
    # Category statistics
    pipeline = [
        {"$group": {"_id": "$category_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    category_stats = await db.feedback.aggregate(pipeline).to_list(10)
    
    # Department statistics
    dept_pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    dept_stats = await db.feedback.aggregate(dept_pipeline).to_list(20)
    
    return {
        "total_feedback": total_feedback,
        "resolved_feedback": resolved_feedback,
        "resolution_rate": round((resolved_feedback / total_feedback * 100) if total_feedback > 0 else 0, 2),
        "category_stats": category_stats,
        "department_stats": dept_stats,
        "last_updated": datetime.now(timezone.utc)
    }

# WebSocket endpoints
@api_router.websocket("/ws/admin")
async def websocket_admin_endpoint(websocket: WebSocket):
    await manager.connect(websocket, is_admin=True)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle admin messages if needed
            await manager.send_personal_message(f"Admin message received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, is_admin=True)

@api_router.websocket("/ws/citizen")
async def websocket_citizen_endpoint(websocket: WebSocket):
    await manager.connect(websocket, is_admin=False)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle citizen messages if needed
            await manager.send_personal_message(f"Message received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, is_admin=False)

# Initialize default data
@api_router.post("/init/default-data")
async def initialize_default_data(
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Initialize default categories and admin user"""
    
    # Default categories
    default_categories = [
        {
            "id": str(uuid.uuid4()),
            "name": "Roads & Infrastructure",
            "description": "Potholes, traffic signals, road maintenance",
            "department": "Public Works",
            "icon": "road",
            "color": "#3B82F6",
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Water & Sanitation",
            "description": "Water supply, drainage, sewage issues",
            "department": "Water Department",
            "icon": "droplets",
            "color": "#06B6D4",
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Public Safety",
            "description": "Police, fire safety, emergency services",
            "department": "Police Department",
            "icon": "shield",
            "color": "#EF4444",
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Healthcare",
            "description": "Public health services, hospitals, clinics",
            "department": "Health Department",
            "icon": "heart",
            "color": "#10B981",
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Education",
            "description": "Schools, libraries, educational facilities",
            "department": "Education Department",
            "icon": "book",
            "color": "#8B5CF6",
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Utilities",
            "description": "Electricity, gas, telecommunications",
            "department": "Utilities Department",
            "icon": "zap",
            "color": "#F59E0B",
            "is_active": True
        }
    ]
    
    # Insert categories if they don't exist
    for category in default_categories:
        existing = await db.categories.find_one({"name": category["name"]})
        if not existing:
            await db.categories.insert_one(category)
    
    await log_action(current_user.id, "INITIALIZE", "system", "default-data")
    
    return {"message": "Default data initialized successfully"}

# Include the router
app.include_router(api_router)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Health check
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now(timezone.utc),
        "version": "1.0.0"
    }