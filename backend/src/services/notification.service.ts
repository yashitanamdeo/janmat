import prisma from '../config/db';

export class NotificationService {
    static async getUserNotifications(userId: string) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async markAsRead(notificationId: string) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    }

    static async markAllAsRead(userId: string) {
        return await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }

    static async createNotification(userId: string, message: string, type: string) {
        return await prisma.notification.create({
            data: {
                userId,
                message,
                type,
            },
        });
    }
}
