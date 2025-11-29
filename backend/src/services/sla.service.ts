import cron from 'node-cron';
import prisma from '../config/db';
import { Status, Urgency } from '@prisma/client';
import { rabbitMQService } from '../config/rabbitmq';

export class SLAService {
    static init() {
        // Run every hour
        cron.schedule('0 * * * *', async () => {
            console.log('Running SLA check...');
            await this.checkSLA();
        });
    }

    static async checkSLA() {
        const now = new Date();
        const thresholdHigh = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours
        const thresholdMedium = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours
        const thresholdLow = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours

        // Find overdue complaints
        const overdueComplaints = await prisma.complaint.findMany({
            where: {
                status: { in: [Status.PENDING, Status.IN_PROGRESS] },
                OR: [
                    { urgency: Urgency.HIGH, createdAt: { lt: thresholdHigh } },
                    { urgency: Urgency.MEDIUM, createdAt: { lt: thresholdMedium } },
                    { urgency: Urgency.LOW, createdAt: { lt: thresholdLow } },
                ],
            },
        });

        for (const complaint of overdueComplaints) {
            // Escalate or notify
            console.log(`Escalating complaint ${complaint.id}`);

            // Add timeline event
            await prisma.complaint.update({
                where: { id: complaint.id },
                data: {
                    timeline: {
                        create: {
                            status: complaint.status,
                            comment: 'SLA Violated - Escalated to Supervisor',
                            updatedBy: 'SYSTEM',
                        },
                    },
                },
            });

            // Trigger notification
            const user = await prisma.user.findUnique({ where: { id: complaint.userId } });
            if (user?.email) {
                await rabbitMQService.sendNotification({
                    type: 'EMAIL',
                    to: user.email,
                    subject: 'Complaint Escalated',
                    text: `Your complaint "${complaint.title}" has been escalated due to SLA violation.`,
                });
            }
        }
    }
}
