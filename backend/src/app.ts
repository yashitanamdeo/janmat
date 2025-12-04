import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import complaintRoutes from './routes/complaint.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import departmentRoutes from './routes/department.routes';
import feedbackRoutes from './routes/feedback.routes';
import analyticsRoutes from './routes/analytics.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';

import officerRoutes from './routes/officer.routes';
import docsRouter from './docs';

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.CORS_ORIGIN || 'https://janmat.vercel.app',
        process.env.FRONTEND_URL || 'https://janmat.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
// API documentation (OpenAPI + static UI)
app.use('/docs', docsRouter);

app.get('/', (req, res) => {
    res.send('Janmat API is running');
});

export default app;
