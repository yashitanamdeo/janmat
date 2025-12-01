# Enhanced Features Implementation Guide

## Backend Changes Completed

### 1. Admin Routes (backend/src/routes/admin.routes.ts)
Added new routes:
```typescript
// New routes for enhanced functionality
router.get('/feedback', AdminController.getAllFeedback);
router.patch('/officers/:officerId/department', AdminController.updateOfficerDepartment);
router.patch('/complaints/:id/department', AdminController.updateComplaintDepartment);
```

### 2. Admin Controller Methods to Add (backend/src/controllers/admin.controller.ts)

Add these methods before the closing brace of the AdminController class:

```typescript
// Get all feedback for admin review
static getAllFeedback = catchAsync(async (req: Request, res: Response) => {
    const feedbacks = await prisma.feedback.findMany({
        include: {
            complaint: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    res.json(feedbacks);
});

// Update officer's department assignment
static updateOfficerDepartment = catchAsync(async (req: Request, res: Response) => {
    const { officerId } = req.params;
    const { departmentId } = req.body;

    const officer = await prisma.user.update({
        where: { id: officerId },
        data: {
            departmentId: departmentId || null,
        },
        include: {
            department: true,
        },
    });

    res.json(officer);
});

// Update complaint's department (and optionally reassign officer)
static updateComplaintDepartment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { departmentId, officerId } = req.body;

    const updateData: any = {
        departmentId: departmentId || null,
    };

    // If officer is provided, assign it
    if (officerId !== undefined) {
        updateData.assignedTo = officerId || null;
        if (officerId) {
            updateData.status = 'IN_PROGRESS';
        }
    }

    const complaint = await prisma.complaint.update({
        where: { id },
        data: updateData,
        include: {
            department: true,
            assignedOfficer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    department: true,
                },
            },
        },
    });

    res.json(complaint);
});
```

### 3. Enhanced getAllComplaints Method

Update the `getAllComplaints` method to include department and feedback:

```typescript
static getAllComplaints = catchAsync(async (req: Request, res: Response) => {
    const complaints = await prisma.complaint.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            assignedOfficer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    department: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
            feedback: {
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    res.json(complaints);
});
```

### 4. Enhanced getOfficers Method

Update the `getOfficers` method to include department info:

```typescript
static getOfficers = catchAsync(async (req: Request, res: Response) => {
    const officers = await prisma.user.findMany({
        where: { role: 'OFFICER' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    res.json(officers);
});
```

## Frontend Components Needed

### 1. Officer Management Component
Create `frontend/src/components/admin/OfficerManagement.tsx`
- List all officers with their departments
- Allow admin to assign/change officer departments
- Filter officers by department

### 2. Enhanced Complaint Assignment Modal
Update `frontend/src/components/admin/AssignComplaintModal.tsx`
- Add department dropdown
- Filter officers by selected department
- Show officer's current department

### 3. Feedback Dashboard
Create `frontend/src/components/admin/FeedbackDashboard.tsx`
- Display all feedback with ratings
- Show complaint title and citizen name
- Filter by rating/date

### 4. Citizen Dashboard Enhancement
Update `frontend/src/pages/Dashboard.tsx`
- Display department name on each complaint card
- Show department badge with color coding

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/feedback` | Get all feedback |
| PATCH | `/api/admin/officers/:officerId/department` | Assign officer to department |
| PATCH | `/api/admin/complaints/:id/department` | Move complaint to department & assign officer |
| GET | `/api/admin/complaints` | Get all complaints (enhanced with department & feedback) |
| GET | `/api/admin/officers` | Get all officers (enhanced with department) |

## Next Steps

1. ✅ Backend routes added
2. ⏳ Add new methods to AdminController
3. ⏳ Update getAllComplaints and getOfficers methods
4. ⏳ Create frontend components
5. ⏳ Integrate into dashboards
