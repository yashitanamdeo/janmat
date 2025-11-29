import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import prisma from '../config/db';

export class AdminController {
    static getDashboardStats = catchAsync(async (req: Request, res: Response) => {
        const totalComplaints = await prisma.complaint.count();
        const pendingComplaints = await prisma.complaint.count({ where: { status: 'PENDING' } });
        const inProgressComplaints = await prisma.complaint.count({ where: { status: 'IN_PROGRESS' } });
        const resolvedComplaints = await prisma.complaint.count({ where: { status: 'RESOLVED' } });
        const totalUsers = await prisma.user.count();
        const totalOfficers = await prisma.user.count({ where: { role: 'OFFICER' } });

        res.json({
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolvedComplaints,
            totalUsers,
            totalOfficers,
        });
    });

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
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(complaints);
    });

    static getOfficers = catchAsync(async (req: Request, res: Response) => {
        const officers = await prisma.user.findMany({
            where: { role: 'OFFICER' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
            },
        });

        res.json(officers);
    });

    static assignComplaint = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { officerId } = req.body;

        const complaint = await prisma.complaint.update({
            where: { id },
            data: {
                assignedTo: officerId,
                status: 'IN_PROGRESS',
            },
            include: {
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json(complaint);
    });

    static assignComplaintAlt = catchAsync(async (req: Request, res: Response) => {
        const { complaintId, officerId } = req.body;

        const complaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                assignedTo: officerId,
                status: 'IN_PROGRESS',
            },
            include: {
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json(complaint);
    });

    static downloadReport = catchAsync(async (req: Request, res: Response) => {
        const complaints = await prisma.complaint.findMany({
            include: {
                user: true,
                assignedOfficer: true,
            },
        });

        // Simple CSV export
        const csv = [
            ['ID', 'Title', 'Status', 'Urgency', 'Created By', 'Assigned To', 'Created At'].join(','),
            ...complaints.map(c => [
                c.id,
                c.title,
                c.status,
                c.urgency,
                c.user.email,
                c.assignedOfficer?.email || 'Unassigned',
                c.createdAt.toISOString(),
            ].join(',')),
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=complaints-report.csv');
        res.send(csv);
    });
}
