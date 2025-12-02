import { Request, Response } from 'express';
import prisma from '../config/db';
import catchAsync from '../utils/catchAsync';

export class NotificationController {
    static getMyNotifications = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(notifications);
    });

    static markAsRead = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const notification = await prisma.notification.updateMany({
            where: {
                id,
                userId
            },
            data: { read: true }
        });

        res.json(notification);
    });

    static markAllAsRead = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });

        res.json({ success: true });
    });
}
