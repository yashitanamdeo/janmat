import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import prisma from '../config/db';
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay, subDays } from 'date-fns';

export class AnalyticsController {
    // Get complaint trends (last 6 months)
    static getComplaintTrends = catchAsync(async (req: Request, res: Response) => {
        const months = 6;
        const trends = [];

        for (let i = months - 1; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);
            const monthName = format(date, 'MMM');

            const count = await prisma.complaint.count({
                where: {
                    createdAt: {
                        gte: start,
                        lte: end,
                    },
                },
            });

            const resolvedCount = await prisma.complaint.count({
                where: {
                    status: 'RESOLVED',
                    updatedAt: { // Using updatedAt as proxy for resolution time if resolvedAt is null
                        gte: start,
                        lte: end,
                    },
                },
            });

            trends.push({
                name: monthName,
                total: count,
                resolved: resolvedCount,
            });
        }

        res.status(200).json(trends);
    });

    // Get department performance
    static getDepartmentPerformance = catchAsync(async (req: Request, res: Response) => {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: {
                        complaints: true,
                    },
                },
                complaints: {
                    where: {
                        status: 'RESOLVED',
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });

        const performance = departments.map(dept => {
            const total = dept._count.complaints;
            const resolved = dept.complaints.length;
            const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

            return {
                name: dept.name,
                total,
                resolved,
                resolutionRate,
            };
        });

        res.status(200).json(performance);
    });

    // Get complaint status distribution
    static getStatusDistribution = catchAsync(async (req: Request, res: Response) => {
        const distribution = await prisma.complaint.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });

        const formatted = distribution.map(item => ({
            name: item.status,
            value: item._count.status,
        }));

        res.status(200).json(formatted);
    });

    // Get urgency distribution
    static getUrgencyDistribution = catchAsync(async (req: Request, res: Response) => {
        const distribution = await prisma.complaint.groupBy({
            by: ['urgency'],
            _count: {
                urgency: true,
            },
        });

        const formatted = distribution.map(item => ({
            name: item.urgency,
            value: item._count.urgency,
        }));

        res.status(200).json(formatted);
    });
}
