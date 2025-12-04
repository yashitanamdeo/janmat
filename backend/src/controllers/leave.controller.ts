import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';

export class LeaveController {
    // Apply for leave (Officer)
    static applyLeave = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { type, startDate, endDate, reason } = req.body;

        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (days <= 0) {
            throw new AppError('End date must be after start date', 400);
        }

        const leave = await prisma.leave.create({
            data: {
                userId,
                type,
                startDate: start,
                endDate: end,
                reason,
                days,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        // Get all admins to notify them
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        // Create notifications for all admins
        await Promise.all(
            admins.map(admin =>
                prisma.notification.create({
                    data: {
                        userId: admin.id,
                        title: 'New Leave Request',
                        message: `${leave.user.name} has requested ${type} leave for ${days} day(s)`,
                        type: 'LEAVE',
                    }
                })
            )
        );

        res.status(201).json(leave);
    });

    // Get my leaves (Officer)
    static getMyLeaves = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { status } = req.query;

        const where: any = { userId };
        if (status) {
            where.status = status;
        }

        const leaves = await prisma.leave.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(leaves);
    });

    // Get all leave requests (Admin)
    static getAllLeaves = catchAsync(async (req: Request, res: Response) => {
        const { status, departmentId } = req.query;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (departmentId) {
            where.user = {
                departmentId: departmentId as string
            };
        }

        const leaves = await prisma.leave.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        department: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(leaves);
    });

    // Approve leave (Admin)
    static approveLeave = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const adminId = (req as any).user.id;
        const { comments } = req.body;

        const leave = await prisma.leave.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!leave) {
            throw new AppError('Leave request not found', 404);
        }

        if (leave.status !== 'PENDING') {
            throw new AppError('Leave request already processed', 400);
        }

        const updated = await prisma.leave.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy: adminId,
                approvedAt: new Date(),
                comments,
            }
        });

        // Notify officer
        await prisma.notification.create({
            data: {
                userId: leave.userId,
                title: 'Leave Approved',
                message: `Your ${leave.type} leave request has been approved`,
                type: 'LEAVE',
            }
        });

        res.json(updated);
    });

    // Reject leave (Admin)
    static rejectLeave = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const adminId = (req as any).user.id;
        const { comments } = req.body;

        const leave = await prisma.leave.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!leave) {
            throw new AppError('Leave request not found', 404);
        }

        if (leave.status !== 'PENDING') {
            throw new AppError('Leave request already processed', 400);
        }

        const updated = await prisma.leave.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectedBy: adminId,
                rejectedAt: new Date(),
                comments,
            }
        });

        // Notify officer
        await prisma.notification.create({
            data: {
                userId: leave.userId,
                title: 'Leave Rejected',
                message: `Your ${leave.type} leave request has been rejected. ${comments || ''}`,
                type: 'LEAVE',
            }
        });

        res.json(updated);
    });

    // Cancel leave (Officer)
    static cancelLeave = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const leave = await prisma.leave.findUnique({
            where: { id }
        });

        if (!leave) {
            throw new AppError('Leave request not found', 404);
        }

        if (leave.userId !== userId) {
            throw new AppError('Not authorized', 403);
        }

        if (leave.status !== 'PENDING') {
            throw new AppError('Can only cancel pending leave requests', 400);
        }

        await prisma.leave.delete({
            where: { id }
        });

        res.json({ message: 'Leave request cancelled successfully' });
    });
}
