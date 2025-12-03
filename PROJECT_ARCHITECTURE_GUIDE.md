# JanMat Project Architecture - Complete Beginner's Guide

## 🏗️ Project Overview

JanMat is a **Complaint Management System** where citizens report infrastructure issues (potholes, streetlights, floods, traffic problems) and government departments manage & resolve them. Think of it like a digital version of calling the municipality office - but organized and trackable.

---

## 📦 System Components (Docker Services)

When you run `docker-compose up`, you're starting **5 separate services** that work together:

### 1. **PostgreSQL Database** 🗄️

**What it does:**
- Stores all permanent data (users, complaints, departments, feedback, etc.)
- Like a filing cabinet that never forgets anything

**Configuration in docker-compose:**
```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - "5433:5432"
  environment:
    - POSTGRES_DB=janmat
    - POSTGRES_USER=janmat_admin
```

**Use Cases:**
- ✅ Storing user accounts and login credentials
- ✅ Recording every complaint filed by citizens
- ✅ Tracking complaint status updates
- ✅ Storing officer assignments
- ✅ Saving feedback and ratings
- ✅ Storing attendance records

**What happens if you DON'T have it:**
- ❌ App crashes immediately - no data can be saved
- ❌ Every time you restart, all data is lost
- ❌ You can't persist user accounts

**Is it REALLY needed?**
- ✅ **YES - CRITICAL** - This is essential for any production app

**How to use it:**
```typescript
// Backend uses Prisma to talk to PostgreSQL
import prisma from '../config/db';

const complaint = await prisma.complaint.create({
  data: {
    title: "Pothole on Main Street",
    description: "Large hole affecting vehicles",
    userId: currentUserId,
    status: "PENDING"
  }
});
```

---

### 2. **Redis** ⚡

**What it does:**
- Ultra-fast in-memory cache (like computer's RAM, not hard drive)
- Temporarily stores frequently accessed data
- Much faster than querying the database every time

**Configuration:**
```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

**Use Cases:**
- ✅ **Session Management**: Remembering that user is logged in
- ✅ **Caching**: Storing frequently viewed data (top complaints, statistics)
- ✅ **Rate Limiting**: Preventing spam (max 10 requests per minute per user)
- ✅ **Real-time Notifications**: Quick message delivery
- ✅ **Temporary Data**: OTP codes, password reset tokens (auto-expiring)

**Example - Storing OTP for 5 minutes:**
```typescript
// Send OTP code
await redis.set(
  `otp:${userEmail}`,
  '123456',
  'EX', 300  // Expires in 300 seconds (5 minutes)
);

// Later, verify the OTP
const storedOTP = await redis.get(`otp:${userEmail}`);
```

**What happens if you DON'T have it:**
- ❌ Everything still works, but SLOWLY
- ❌ Database gets hammered with repeat queries
- ❌ Session management becomes unreliable
- ❌ Real-time features are delayed

**Is it REALLY needed?**
- ⚠️ **NO for MVP (Minimum Viable Product)** - App works without it
- ✅ **YES for Production** - Critical for performance and user experience

**Smart Feature in this project:**
The backend has a **fallback mechanism** - if Redis is down, it automatically switches to in-memory mock storage:

```typescript
// From redis.ts
retryStrategy: (times) => {
    if (times > 3) {
        console.warn('Redis connection failed, using mock mode');
        this.useMock = true;  // Falls back to in-memory Map
        return null;
    }
}
```

---

### 3. **RabbitMQ** 📬

**What it does:**
- Message queue system
- Decouples different parts of your app
- Like a post office: app puts messages in, workers pick them up

**Configuration:**
```yaml
rabbitmq:
  image: rabbitmq:3-management-alpine
  ports:
    - "5672:5672"      # AMQP protocol
    - "15672:15672"    # Management UI
```

**Use Cases:**
- ✅ **Async Notifications**: Send notification to user without making them wait
- ✅ **Email Sending**: Queue emails, send them in background
- ✅ **Heavy Processing**: Complex calculations don't block the main app
- ✅ **Retries**: If worker fails, message stays in queue to retry

**Example - Async Notification:**

Without RabbitMQ (synchronous - user waits):
```typescript
// User has to WAIT for notification to be sent
sendNotification(userId, "Your complaint was resolved");
res.json({ status: "success" }); // Response only after notification is sent
```

With RabbitMQ (asynchronous - user doesn't wait):
```typescript
// Just put message in queue - done instantly!
await rabbitMQService.sendNotification({
  userId: userId,
  message: "Your complaint was resolved"
});
res.json({ status: "success" }); // Response immediate!

// Worker picks it up separately and processes it
// Even if worker is slow, user already got response
```

**What happens if you DON'T have it:**
- ❌ All notifications are sent synchronously (users wait)
- ❌ If one task is slow, entire app slows down
- ❌ No retry mechanism for failed tasks
- ❌ Can't handle heavy background jobs

**Is it REALLY needed?**
- ⚠️ **NO for MVP** - Use simple async/await
- ✅ **YES for Scale** - When you have thousands of users

---

### 4. **Backend (Node.js/Express)** 🖥️

**What it does:**
- Your API server - handles all business logic
- Receives requests from frontend
- Talks to database, cache, and message queue

**Port:** 3000

**Key Files:**
```
backend/
  src/
    app.ts              # Express app setup
    server.ts           # Server entry point
    config/
      db.ts            # Database connection
      redis.ts         # Redis client
      rabbitmq.ts      # RabbitMQ connection
    controllers/        # Business logic (what to do with requests)
    routes/            # URL paths
    services/          # Helper functions
    middlewares/       # Auth checks, logging
```

**What it Does:**
```typescript
// Example: Citizen files a complaint
POST /api/complaints
{
  title: "Pothole on Main Street",
  description: "Deep hole affecting traffic",
  location: "40.7128,-74.0060",
  category: "pothole"
}

// Backend:
// 1. Validates data
// 2. Checks user is authenticated
// 3. Saves to PostgreSQL database
// 4. Puts notification in RabbitMQ queue
// 5. Caches the complaint in Redis
// 6. Returns response to frontend
```

**Is it REALLY needed?**
- ✅ **YES - CRITICAL** - This is the heart of your app

---

### 5. **Frontend (React/Vite)** 🎨

**What it does:**
- Website UI that users see in browser
- Sends requests to backend API
- Shows complaints, allows filing new ones

**Port:** 5173

**Key Files:**
```
frontend/
  src/
    pages/
      Dashboard.tsx          # Main dashboard
      Login.tsx             # Login page
      DepartmentManagement  # Officer dashboard
    components/            # Reusable UI components
    store/                 # State management (Redux)
```

**Example Flow:**
1. User opens http://localhost:5173
2. Sees a form to report complaint
3. Clicks "Submit"
4. Frontend sends POST request to backend
5. Backend processes and saves to database
6. Backend returns success response
7. Frontend shows "Complaint submitted!" message

**Is it REALLY needed?**
- ✅ **YES** - Without it, users have no UI to interact with

---

## 🔄 How They All Work Together

### Scenario: Citizen Reports a Pothole

```
1. Citizen fills form on FRONTEND (React)
   ↓
2. Clicks "Submit" → sends POST to BACKEND
   ↓
3. BACKEND (Express server running) receives request
   ↓
4. BACKEND authenticates using JWT (checks if user is logged in)
   ↓
5. BACKEND validates data
   ↓
6. BACKEND saves to POSTGRESQL (permanent storage)
   ↓
7. BACKEND puts notification task in RABBITMQ queue
   ↓
8. BACKEND caches complaint summary in REDIS (fast access)
   ↓
9. BACKEND responds immediately to FRONTEND
   ↓
10. Worker process (background job) picks from RABBITMQ
    ↓
11. Sends notification to assigned officer
    ↓
12. Officer sees new complaint on their dashboard
```

---

## 🚀 Startup Sequence (What `docker-compose up` Does)

```
1. PostgreSQL starts first
   ├─ Creates janmat database
   └─ Initializes schema from Prisma

2. Redis starts
   └─ Ready for caching

3. RabbitMQ starts
   └─ Management UI at http://localhost:15672

4. Backend starts (depends on postgres, redis, rabbitmq)
   ├─ Connects to PostgreSQL
   ├─ Connects to Redis
   ├─ Connects to RabbitMQ
   ├─ Starts Express server on port 3000
   └─ Listens for requests

5. Frontend starts (depends on backend)
   ├─ Dev server on port 5173
   └─ Loads React app

All services connected via "janmat-network" bridge
```

---

## 📊 Environment Variables (What Each Means)

```bash
# Database connection
DATABASE_URL=postgresql://user:password@postgres:5432/janmat
# ↑ User credentials for PostgreSQL

# Security
JWT_SECRET=dev_secret_key
# ↑ Secret key for creating/validating authentication tokens
# If hacked, attackers can impersonate any user!

# Cache
REDIS_URL=redis://redis:6379
# ↑ Address of Redis server

# Message Queue
RABBITMQ_URL=amqp://rabbitmq
# ↑ Address of RabbitMQ server

# Frontend API
VITE_API_URL=http://localhost:3000
# ↑ Where frontend sends requests to
```

---

## 🗂️ Data Flow Diagram

```
┌─────────────┐
│  Frontend   │ (React - Port 5173)
│  (Browser)  │
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────────────────────┐
│  Backend (Express)          │ (Port 3000)
│                             │
│  ├─ Routes                  │
│  ├─ Controllers (logic)     │
│  └─ Services (helpers)      │
└──────┬─────────┬────────────┘
       │         │
    Query    Put in Queue
       │         │
       ↓         ↓
   ┌────────┐  ┌────────┐
   │Postgres│  │RabbitMQ│
   │(Data)  │  │(Queue) │
   └────────┘  └────┬───┘
                    │
                    ↓ Background Worker
              Processes notifications
```

---

## 💾 Data Models (What Gets Stored)

### User
```
- id, name, email, phone
- password (hashed for security!)
- role: CITIZEN, ADMIN, or OFFICER
- department: which department they work for
- profilePicture, aadharNumber
```

### Complaint
```
- id, title, description
- status: PENDING → IN_PROGRESS → RESOLVED
- location (GPS coordinates)
- category: pothole, flood, streetlight, traffic
- userId (who filed it)
- assignedOfficer (who's handling it)
- createdAt, updatedAt
- images/attachments
```

### Feedback
```
- id, rating (1-5 stars)
- comment
- complaintId (feedback on which complaint)
- userId (who gave feedback)
```

### Department
```
- id, name (Public Works, Traffic Management)
- officers (list of officers)
- complaints assigned to this department
```

---

## ⚙️ Configuration & Setup

### Step 1: Install Docker
```bash
# Download Docker Desktop
https://www.docker.com/products/docker-desktop
```

### Step 2: Start Services
```bash
docker-compose up
# Waits for all services to be healthy
```

### Step 3: Verify All Services Running
```bash
docker-compose ps
# Should show all 5 services with status "running"
```

### Step 4: Check Individual Services

**Backend Health:**
```bash
curl http://localhost:3000/api/health
```

**RabbitMQ Management UI:**
```
http://localhost:15672
Username: guest
Password: guest
```

**PostgreSQL Connection:**
```bash
psql postgresql://janmat_admin:secure_password@localhost:5433/janmat
```

**Redis CLI:**
```bash
redis-cli -h localhost -p 6379
> PING
# Should return: PONG
```

---

## 🚨 Common Issues & Solutions

### "Connection refused" for PostgreSQL
```
Reason: Database not ready yet
Solution: Wait 10 seconds and try again
docker-compose up -d  # Wait for all services to start
docker logs janmat-postgres
```

### Redis connection failed
```
Reason: Redis might be down
Solution: Backend automatically falls back to in-memory cache
docker-compose restart redis
```

### RabbitMQ not connecting
```
Reason: Queue server not ready
Solution: 
docker-compose restart rabbitmq
# Or just restart everything:
docker-compose down && docker-compose up
```

### Ports already in use
```
Reason: Another app using same port
Solution:
# Stop the other app OR change port in docker-compose.yml
# For example, change 5433:5432 to 5434:5432
```

---

## 🎯 Minimal vs Full Setup

### Minimal Setup (For Learning/Testing)
```yaml
# Only database + backend + frontend
# Skip: Redis, RabbitMQ (not essential for MVP)
services:
  backend
  frontend
  postgres
```

**Trade-offs:**
- ✅ Simpler setup
- ✅ Less resource usage
- ❌ No caching (slower for large datasets)
- ❌ All notifications must be synchronous (slow)

### Full Setup (For Production)
```yaml
# All 5 services
# Recommended when you have thousands of users
services:
  backend
  frontend
  postgres
  redis
  rabbitmq
```

**Trade-offs:**
- ✅ Fast caching
- ✅ Async job processing
- ✅ Can handle scale
- ❌ More complex to manage
- ❌ Needs more server resources

---

## 🔐 Security Notes

### JWT_SECRET
```
⚠️ NEVER commit real secret to GitHub!

Development (safe):
JWT_SECRET=dev_secret_key_123

Production (must be random & strong):
JWT_SECRET=$(openssl rand -base64 32)
# Store in environment variables, not code!
```

### Database Password
```
⚠️ Change default password in docker-compose!

Current (UNSAFE):
POSTGRES_PASSWORD=secure_password

Real Production:
POSTGRES_PASSWORD=$(openssl rand -base64 20)
# Use strong random password
```

---

## 📈 Performance Considerations

### Without Optimization (Slow)
```
Every request → Query database → Response
Each query takes 200ms, so 5 simultaneous requests = 1 second wait
```

### With Redis Caching (Fast)
```
First request → Query database → Cache in Redis → Response
Second request → Get from Redis (1ms!) → Response
100x faster! ⚡
```

### With RabbitMQ (Non-blocking)
```
Without RabbitMQ:
Request → Send Email (5 seconds) → Response to user
User has to wait!

With RabbitMQ:
Request → Queue message (instant) → Response to user immediately
Background worker sends email later
```

---

## ✅ Quick Checklist

Before running the app, ensure:

- [ ] Docker installed and running
- [ ] Port 3000 is free (backend)
- [ ] Port 5173 is free (frontend)
- [ ] Port 5432 is free (database)
- [ ] Port 6379 is free (redis)
- [ ] Port 5672, 15672 free (rabbitmq)
- [ ] At least 4GB RAM available

---

## 🎓 Next Steps to Learn

1. **Understand Database Schema** → Open `backend/prisma/schema.prisma`
2. **Check API Routes** → Open `backend/src/routes/`
3. **Read Controllers** → See business logic in `backend/src/controllers/`
4. **Test with Postman** → Try calling API endpoints
5. **Check Frontend** → Browse `frontend/src/pages/`

---

## 📞 FAQ

**Q: Do I really need all 5 services to start?**
A: For development, you can skip Redis & RabbitMQ. But PostgreSQL + Backend + Frontend are essential.

**Q: Why use Docker instead of running locally?**
A: Docker ensures everyone has the same environment. No "works on my machine" problems!

**Q: Can I run without Redis?**
A: Yes! But it'll be slow. The backend has a fallback mechanism.

**Q: What if I only want to run backend?**
A: Run just `docker-compose up postgres backend` - skip frontend, redis, rabbitmq

**Q: How do I see logs?**
A: `docker-compose logs -f backend` (follow backend logs)
   `docker-compose logs -f postgres` (follow database logs)

**Q: Can I modify code while Docker is running?**
A: Yes! Volumes are mounted. Changes auto-sync. (Frontend needs restart for some changes)

---

**You now understand the complete architecture! 🎉**

Next: Try running `docker-compose up` and test the API at http://localhost:3000
