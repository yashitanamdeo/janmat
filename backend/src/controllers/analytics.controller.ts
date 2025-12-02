import { Request, Response } from 'express';
import prisma from '../config/db';
import catchAsync from '../utils/catchAsync';

export class AnalyticsController {
    static getDepartmentPerformance = catchAsync(async (req: Request, res: Response) => {
        const { timeRange } = req.query;

        let dateFilter = {};
        if (timeRange) {
            const now = new Date();
            const pastDate = new Date();
            if (timeRange === '7d') pastDate.setDate(now.getDate() - 7);
            else if (timeRange === '30d') pastDate.setDate(now.getDate() - 30);
            else if (timeRange === '90d') pastDate.setDate(now.getDate() - 90);

            dateFilter = {
                createdAt: {
                    gte: pastDate
                }
            };
        }

        const departments = await prisma.department.findMany({
            include: {
                officers: true,
                complaints: {
                    where: dateFilter,
                    include: {
                        feedback: true
                    }
                }
            }
        });

        const stats = departments.map(dept => {
            const totalComplaints = dept.complaints.length;
            const resolvedComplaints = dept.complaints.filter(c => c.status === 'RESOLVED');
            const pendingComplaints = dept.complaints.filter(c => c.status !== 'RESOLVED');

            // Calculate average resolution time (in days)
            let totalResolutionTime = 0;
            let resolvedCountWithTime = 0;

            resolvedComplaints.forEach(c => {
                if (c.resolvedAt) {
                    const diffTime = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);
                    totalResolutionTime += diffDays;
                    resolvedCountWithTime++;
                }
            });

            const avgResolutionTime = resolvedCountWithTime > 0 ? totalResolutionTime / resolvedCountWithTime : 0;

            // Calculate satisfaction score (average rating * 20 to get percentage)
            let totalRating = 0;
            let feedbackCount = 0;

            dept.complaints.forEach(c => {
                if (c.feedback) {
                    totalRating += c.feedback.rating;
                    feedbackCount++;
                }
            });

            const avgRating = feedbackCount > 0 ? totalRating / feedbackCount : 0;
            const satisfactionScore = feedbackCount > 0 ? Math.round(avgRating * 20) : 0; // 5 stars = 100%

            return {
                departmentId: dept.id,
                departmentName: dept.name,
                totalComplaints,
                resolved: resolvedComplaints.length,
                pending: pendingComplaints.length,
                avgResolutionTime,
                satisfactionScore,
                activeOfficers: dept.officers.length
            };
        });

        res.json(stats);
    });

    static getTrends = catchAsync(async (req: Request, res: Response) => {
        const { timeRange } = req.query;

        const now = new Date();
        const pastDate = new Date();
        let days = 30;

        if (timeRange === '7d') days = 7;
        else if (timeRange === '90d') days = 90;

        pastDate.setDate(now.getDate() - days);

        const complaints = await prisma.complaint.findMany({
            where: {
                createdAt: {
                    gte: pastDate
                }
            },
            select: {
                createdAt: true,
                status: true,
                resolvedAt: true
            }
        });

        // Group by date
        const trendsMap = new Map<string, { complaints: number, resolved: number }>();

        // Initialize all dates
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            trendsMap.set(dateStr, { complaints: 0, resolved: 0 });
        }

        complaints.forEach(c => {
            const createdDate = new Date(c.createdAt).toISOString().split('T')[0];
            if (trendsMap.has(createdDate)) {
                trendsMap.get(createdDate)!.complaints++;
            }

            if (c.status === 'RESOLVED' && c.resolvedAt) {
                const resolvedDate = new Date(c.resolvedAt).toISOString().split('T')[0];
                if (trendsMap.has(resolvedDate)) {
                    trendsMap.get(resolvedDate)!.resolved++;
                }
            }
        });

        const trends = Array.from(trendsMap.entries())
            .map(([date, data]) => ({
                date,
                complaints: data.complaints,
                resolved: data.resolved
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        res.json(trends);
    });
}
