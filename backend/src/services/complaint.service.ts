import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { Status, Urgency } from '@prisma/client';
import { rabbitMQService } from '../config/rabbitmq';
import { getIO } from '../config/socket';
import { CategorizationService } from './categorization.service';

export class ComplaintService {
    static async createComplaint(userId: string, data: any, files: Express.Multer.File[]) {
        let { title, description, urgency, location, category } = data;

        if (!category) {
            category = CategorizationService.predictCategory(`${title} ${description}`);
        }

        const complaint = await prisma.complaint.create({
            data: {
                title,
                description,
                category,
                urgency: urgency as Urgency,
                location,
                userId,
                status: Status.PENDING,
                attachments: {
                    create: files.map((file) => ({
                        url: file.path,
                        type: file.mimetype.startsWith('image') ? 'IMAGE' : 'VIDEO',
                    })),
                },
                timeline: {
                    create: {
                        status: Status.PENDING,
                        comment: 'Complaint registered',
                        updatedBy: 'SYSTEM',
                    },
                },
            },
            include: { attachments: true, timeline: true },
        });

        // Send Notification
        const notificationData = {
            type: 'EMAIL',
            to: (await prisma.user.findUnique({ where: { id: userId } }))?.email,
            subject: 'Complaint Registered',
            text: `Your complaint "${title}" has been registered successfully.`,
        };
        await rabbitMQService.sendNotification(notificationData);

        return complaint;
    }

    static async getMyComplaints(userId: string) {
        return await prisma.complaint.findMany({
            where: { userId },
            include: {
                attachments: true,
                timeline: true,
                feedback: true,
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async updateStatus(complaintId: string, status: Status, comment: string, updatedBy: string) {
        const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
        if (!complaint) throw new AppError('Complaint not found', 404);

        const updateData: any = {
            status,
            timeline: {
                create: {
                    status,
                    comment,
                    updatedBy,
                },
            },
        };

        // Set resolvedAt timestamp when complaint is resolved
        if (status === Status.RESOLVED && !complaint.resolvedAt) {
            updateData.resolvedAt = new Date();
        }

        const updatedComplaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: updateData,
            include: {
                timeline: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
        });

        // Real-time update
        try {
            const io = getIO();
            io.to(updatedComplaint.userId).emit('complaint_updated', updatedComplaint);
        } catch (e) {
            console.error('Socket error:', e);
        }

        return updatedComplaint;
    }

    static async getAssignedComplaints(officerId: string) {
        return await prisma.complaint.findMany({
            where: { assignedTo: officerId },
            include: {
                attachments: true,
                timeline: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async updateComplaint(complaintId: string, userId: string, data: any) {
        const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
        if (!complaint) throw new AppError('Complaint not found', 404);

        if (complaint.userId !== userId) {
            throw new AppError('Not authorized to update this complaint', 403);
        }

        return await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                title: data.title,
                description: data.description,
                urgency: data.urgency,
                location: data.location,
            },
            include: { attachments: true, timeline: true },
        });
    }

    static async deleteComplaint(complaintId: string, userId: string) {
        const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
        if (!complaint) throw new AppError('Complaint not found', 404);

        if (complaint.userId !== userId) {
            throw new AppError('Not authorized to delete this complaint', 403);
        }

        // Delete related records manually since Cascade is not set in schema
        await prisma.complaintTimeline.deleteMany({ where: { complaintId } });
        await prisma.attachment.deleteMany({ where: { complaintId } });

        return await prisma.complaint.delete({
            where: { id: complaintId },
        });
    }
}
