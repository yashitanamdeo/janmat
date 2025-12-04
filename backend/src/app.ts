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

// CORS configuration with dynamic origin handling
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    'https://janmat.vercel.app',
    'https://janmat-beta.vercel.app'
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or is a vercel.app subdomain
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // Cache preflight for 10 minutes
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
