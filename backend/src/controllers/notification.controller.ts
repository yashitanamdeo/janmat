import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import catchAsync from '../utils/catchAsync';

export class NotificationController {
    static getNotifications = catchAsync(async (req: Request, res: Response) => {
        const notifications = await NotificationService.getUserNotifications((req as any).user.id);
        res.json({ status: 'success', data: notifications });
    });

    static markAsRead = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        await NotificationService.markAsRead(id);
        res.json({ status: 'success', message: 'Notification marked as read' });
    });

    static markAllAsRead = catchAsync(async (req: Request, res: Response) => {
        await NotificationService.markAllAsRead((req as any).user.id);
        res.json({ status: 'success', message: 'All notifications marked as read' });
    });
}
