# Implementation Plan - Notification System & Advanced Features

## ✅ Phase 1: Small Fixes (COMPLETED)

### 1. Location Search Results Z-Index Fix ✅
- **Issue**: Search results dropdown hidden behind map
- **Solution**: Increased z-index from `z-50` to `z-[1000]`
- **Added**: Max height and scroll for long results list

### 2. Citizen Dashboard - Show Department & Officer ✅
- **Issue**: Assigned department and officer not visible
- **Solution**: Added `assignedOfficer` to `getMyComplaints` service include
- **Now Shows**: Officer name, email, and department name

## 🚀 Phase 2: Notification System (IN PROGRESS)

### Architecture
```
Notification Flow:
1. Event Triggered → 2. Create Notification → 3. Store in DB → 4. Send via Socket.IO → 5. Display in UI
```

### Notification Types

#### For Citizens:
1. **Complaint Registered** - When complaint is created
2. **Department Assigned** - When department is assigned
3. **Officer Assigned** - When officer is assigned  
4. **Status Changed to IN_PROGRESS** - Work started
5. **Status Changed to RESOLVED** - Complaint resolved
6. **Status Changed to REJECTED** - Complaint rejected
7. **Feedback Request** - When resolved, ask for feedback
8. **Comment Added** - When officer adds a comment

#### For Officers:
1. **Complaint Assigned** - New complaint assigned
2. **Reminder from Admin** - Admin sends reminder
3. **Deadline Approaching** - Auto reminder before deadline
4. **Complaint Updated** - Citizen updates complaint
5. **Feedback Received** - Citizen submits feedback

#### For Admin:
1. **New Complaint** - New complaint registered
2. **Unassigned Complaint** - Complaint pending assignment
3. **High Urgency Complaint** - High priority complaint
4. **Leave Request** - Officer requests leave
5. **Attendance Alert** - Officer absent without leave
6. **SLA Breach** - Complaint exceeds resolution time
7. **Low Satisfaction** - Negative feedback received

### Database Schema Addition
```prisma
model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        NotificationType
  title       String
  message     String
  read        Boolean  @default(false)
  actionUrl   String?
  metadata    Json?
  createdAt   DateTime @default(now())
}

enum NotificationType {
  COMPLAINT_CREATED
  COMPLAINT_ASSIGNED
  STATUS_CHANGED
  FEEDBACK_REQUEST
  REMINDER
  LEAVE_REQUEST
  ATTENDANCE_ALERT
  SLA_BREACH
}
```

## 📋 Phase 3: Attendance & Leave Management

### Features:
1. **Daily Attendance Tracking**
   - Officers mark attendance (Check-in/Check-out)
   - Admin can view attendance reports
   - Monthly attendance summary

2. **Leave Management**
   - Officers request leave
   - Admin approves/rejects leave
   - Leave balance tracking
   - Leave history

3. **Performance Monitoring**
   - Attendance percentage
   - Complaints handled
   - Average resolution time
   - Satisfaction score

### Database Schema Addition
```prisma
model Attendance {
  id         String   @id @default(uuid())
  officerId  String
  officer    User     @relation(fields: [officerId], references: [id])
  date       DateTime
  checkIn    DateTime?
  checkOut   DateTime?
  status     AttendanceStatus
  remarks    String?
  createdAt  DateTime @default(now())
  
  @@unique([officerId, date])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LEAVE
  HALF_DAY
}

model LeaveRequest {
  id          String      @id @default(uuid())
  officerId   String
  officer     User        @relation(fields: [officerId], references: [id])
  startDate   DateTime
  endDate     DateTime
  reason      String
  status      LeaveStatus @default(PENDING)
  approvedBy  String?
  approver    User?       @relation("LeaveApprover", fields: [approvedBy], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}
```

## 🔧 Phase 4: Profile Enhancement

### Additional Fields:
- Date of Birth
- Gender
- Phone Number (already exists)
- Address
- Profile Picture
- Emergency Contact
- Aadhar Number (optional)
- Department (for officers)
- Designation (for officers)

## 🏢 Phase 5: Department Management Enhancement

### Features:
1. **Clickable Counts**
   - Officer count → Opens officers list modal
   - Complaint count → Opens complaints list modal
   
2. **Officer Management**
   - Create new officer
   - Edit officer details
   - Assign to department
   - Deactivate officer

## 📊 Phase 7: Data Seeding for Resolved Complaints

### Script to:
1. Find all resolved complaints
2. Assign random officers from appropriate departments
3. Generate realistic feedback (3-5 stars with comments)
4. Update database

## Implementation Order:

1. ✅ Small Fixes (DONE)
2. 🔄 Notification System Backend
3. 🔄 Notification UI Components
4. 🔄 Profile Page Enhancement
5. 🔄 Department Management - Clickable Counts
6. 🔄 Officer Creation/Edit
7. 🔄 Attendance & Leave System
8. 🔄 Data Seeding Script

Let's proceed step by step!
