import prisma from '../config/db';
import { Status, Urgency } from '@prisma/client';

export class AdminService {
    static async getDashboardStats() {
        const totalComplaints = await prisma.complaint.count();
        const resolvedComplaints = await prisma.complaint.count({ where: { status: Status.RESOLVED } });
        const pendingComplaints = await prisma.complaint.count({ where: { status: Status.PENDING } });

        const urgencyStats = await prisma.complaint.groupBy({
            by: ['urgency'],
            _count: { urgency: true },
        });

        return {
            total: totalComplaints,
            resolved: resolvedComplaints,
            pending: pendingComplaints,
            byUrgency: urgencyStats,
        };
    }

    static async getAllComplaints(filters: any) {
        const { status, urgency, search, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (urgency) where.urgency = urgency;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const complaints = await prisma.complaint.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true, phone: true } } },
        });

        const total = await prisma.complaint.count({ where });

        return { complaints, total, page, pages: Math.ceil(total / limit) };
    }

    static async assignComplaint(complaintId: string, officerId: string) {
        // In a real app, we would have an 'assignedTo' field in Complaint model
        // For now, we'll just log it or update a timeline event
        return await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                timeline: {
                    create: {
                        status: Status.IN_PROGRESS,
                        comment: `Assigned to officer ${officerId}`,
                        updatedBy: 'ADMIN',
                    },
                },
            },
        });
    }
}
