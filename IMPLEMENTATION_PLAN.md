# JanMat Enhancement Implementation Plan

## Overview
This document outlines the implementation of 8 major enhancements to the JanMat complaint management system.

## Features to Implement

### 1. ✅ Fix PDF Export (CRITICAL)
**Status**: Ready to implement
**Dependencies**: pdfkit installed
**Implementation**:
- Replace manual PDF generation with PDFKit library
- Create proper PDF with formatting, tables, and headers
- Include complaint statistics and details

### 2. Password Visibility Toggle
**Status**: Ready to implement
**Implementation**:
- Add eye icon button to password fields
- Toggle between password/text input type
- Implement in Login.tsx and Register.tsx

### 3. Department/Category System
**Status**: Schema updated ✅
**Database Changes**:
- Added Department model
- Linked User.departmentId (for officers)
- Linked Complaint.departmentId
**Implementation Needed**:
- Department CRUD APIs
- Department selection in complaint creation
- Department assignment for officers
- Department-wise filtering

### 4. Feedback & Rating System
**Status**: Schema updated ✅
**Database Changes**:
- Added Feedback model with rating (1-5) and comment
- Linked to Complaint (one-to-one)
**Implementation Needed**:
- Feedback submission UI for citizens (after resolution)
- Feedback display for officers/admins
- Rating aggregation for performance metrics

### 5. Performance Reports & Charts
**Status**: Planning
**Implementation Needed**:
- Department-wise performance metrics
- Officer-wise performance metrics
- Resolution time analytics
- Rating aggregation
- Chart components (using recharts or similar)
- Export functionality

### 6. Complaint Trends & Analytics
**Status**: Planning
**Implementation Needed**:
- Time-series complaint data
- Status distribution over time
- Department-wise trends
- Urgency distribution
- Chart visualizations

### 7. Age Validation (18+ years)
**Status**: Schema updated ✅
**Database Changes**:
- Added dateOfBirth to User model
**Implementation Needed**:
- Date of birth field in registration
- Client-side validation
- Server-side validation (must be 18+)

### 8. Help/FAQ Section
**Status**: Planning
**Implementation Needed**:
- FAQ component with collapsible sections
- Help button in navigation
- Context-sensitive help
- Common questions for citizens, officers, admins

## Implementation Priority

### Phase 1 (Immediate - Critical Fixes)
1. Fix PDF Export
2. Add Password Visibility Toggle
3. Add Age Validation

### Phase 2 (Core Features)
4. Department/Category System
5. Feedback & Rating System

### Phase 3 (Analytics & Reporting)
6. Performance Reports & Charts
7. Complaint Trends & Analytics

### Phase 4 (User Experience)
8. Help/FAQ Section

## Database Migration Required
```bash
npx prisma migrate dev --name add_departments_feedback_dob
npx prisma generate
```

## API Endpoints to Create

### Departments
- GET /api/departments - List all departments
- POST /api/admin/departments - Create department
- PUT /api/admin/departments/:id - Update department
- DELETE /api/admin/departments/:id - Delete department

### Feedback
- POST /api/complaints/:id/feedback - Submit feedback (citizen only, after resolution)
- GET /api/complaints/:id/feedback - Get feedback for a complaint
- GET /api/admin/feedbacks - Get all feedbacks (for analytics)
- GET /api/officer/feedbacks - Get feedbacks for assigned complaints

### Analytics
- GET /api/admin/analytics/trends - Complaint trends over time
- GET /api/admin/analytics/performance - Department/Officer performance
- GET /api/admin/analytics/ratings - Rating aggregation

## UI Components to Create

### Components
1. PasswordInput.tsx - Reusable password field with toggle
2. FeedbackModal.tsx - Feedback submission form
3. FeedbackDisplay.tsx - Display feedback with stars
4. DepartmentSelect.tsx - Department dropdown
5. PerformanceChart.tsx - Performance visualization
6. TrendsChart.tsx - Trends visualization
7. HelpSection.tsx - FAQ accordion
8. DateOfBirthInput.tsx - DOB picker with validation

### Pages/Sections
1. Admin Analytics Dashboard - New section in AdminDashboard
2. Help Modal - Accessible from all dashboards

## Technical Considerations

### Libraries to Install
- ✅ pdfkit - PDF generation
- recharts or chart.js - Charts and graphs
- date-fns - Date manipulation for age validation

### Validation Rules
- Age: Must be 18+ years old
- Feedback: Only for RESOLVED complaints
- Feedback: One per complaint
- Rating: 1-5 stars (integer)

### Performance Optimization
- Cache department list
- Paginate feedback lists
- Aggregate analytics data in backend
- Use indexes on frequently queried fields

## Next Steps
1. Run database migration
2. Implement Phase 1 features
3. Test thoroughly
4. Move to Phase 2
