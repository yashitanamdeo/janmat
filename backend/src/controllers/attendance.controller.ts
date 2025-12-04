import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';

export class AttendanceController {
    // Check In
    static checkIn = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in
        const existing = await prisma.attendance.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        if (existing) {
            throw new AppError('Already checked in for today', 400);
        }

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: new Date(),
                status: 'PRESENT',
                checkIn: new Date(),
            }
        });

        res.status(201).json(attendance);
    });

    // Check Out
    static checkOut = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        if (!attendance) {
            throw new AppError('No check-in record found for today', 404);
        }

        if (attendance.checkOut) {
            throw new AppError('Already checked out for today', 400);
        }

        const updated = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: new Date(),
            }
        });

        res.json(updated);
    });

    // Get My Attendance
    static getMyAttendance = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { month, year } = req.query;

        const where: any = { userId };

        if (month && year) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0);
            where.date = {
                gte: startDate,
                lte: endDate
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            orderBy: { date: 'desc' }
        });

        res.json(attendance);
    });

    // Get All Attendance (Admin)
    static getAllAttendance = catchAsync(async (req: Request, res: Response) => {
        const { date, departmentId } = req.query;

        const where: any = {};

        if (date) {
            const searchDate = new Date(date as string);
            searchDate.setHours(0, 0, 0, 0);
            where.date = {
                gte: searchDate,
                lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
            };
        }

        if (departmentId) {
            where.user = {
                departmentId: departmentId as string
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
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
            },
            orderBy: { date: 'desc' }
        });

        res.json(attendance);
    });

    // Get Today's Status (for Dashboard)
    static getTodayStatus = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        res.json(attendance);
    });
}
