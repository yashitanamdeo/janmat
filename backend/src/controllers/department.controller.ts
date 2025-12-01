import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

const createDepartmentSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
});

const updateDepartmentSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
});

export class DepartmentController {
    // Get all departments
    static getAllDepartments = catchAsync(async (req: Request, res: Response) => {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: {
                        officers: true,
                        complaints: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.status(200).json(departments);
    });

    // Get single department
    static getDepartment = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;

        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                officers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                complaints: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        urgency: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
                _count: {
                    select: {
                        officers: true,
                        complaints: true,
                    },
                },
            },
        });

        if (!department) {
            throw new AppError('Department not found', 404);
        }

        res.status(200).json(department);
    });

    // Create department (Admin only)
    static createDepartment = catchAsync(async (req: Request, res: Response) => {
        const { name, description } = createDepartmentSchema.parse(req.body);

        // Check if department already exists
        const existing = await prisma.department.findUnique({
            where: { name },
        });

        if (existing) {
            throw new AppError('Department with this name already exists', 400);
        }

        const department = await prisma.department.create({
            data: {
                name,
                description,
            },
        });

        res.status(201).json(department);
    });

    // Update department (Admin only)
    static updateDepartment = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = updateDepartmentSchema.parse(req.body);

        // Check if department exists
        const existing = await prisma.department.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new AppError('Department not found', 404);
        }

        // If name is being updated, check for duplicates
        if (data.name && data.name !== existing.name) {
            const duplicate = await prisma.department.findUnique({
                where: { name: data.name },
            });

            if (duplicate) {
                throw new AppError('Department with this name already exists', 400);
            }
        }

        const department = await prisma.department.update({
            where: { id },
            data,
        });

        res.status(200).json(department);
    });

    // Delete department (Admin only)
    static deleteDepartment = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;

        // Check if department exists
        const existing = await prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        officers: true,
                        complaints: true,
                    },
                },
            },
        });

        if (!existing) {
            throw new AppError('Department not found', 404);
        }

        // Prevent deletion if department has officers or complaints
        if (existing._count.officers > 0 || existing._count.complaints > 0) {
            throw new AppError(
                'Cannot delete department with assigned officers or complaints. Please reassign them first.',
                400
            );
        }

        await prisma.department.delete({
            where: { id },
        });

        res.status(200).json({ message: 'Department deleted successfully' });
    });

    // Get officers in a department
    static getDepartmentOfficers = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;

        const officers = await prisma.user.findMany({
            where: {
                departmentId: id,
                role: 'OFFICER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                _count: {
                    select: {
                        assignedComplaints: true,
                    },
                },
            },
        });

        res.status(200).json(officers);
    });

    // Assign officer to department (Admin only)
    static assignOfficerToDepartment = catchAsync(async (req: Request, res: Response) => {
        const { departmentId, officerId } = req.body;

        // Verify department exists
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
        });

        if (!department) {
            throw new AppError('Department not found', 404);
        }

        // Verify officer exists and is an officer
        const officer = await prisma.user.findUnique({
            where: { id: officerId },
        });

        if (!officer || officer.role !== 'OFFICER') {
            throw new AppError('Officer not found', 404);
        }

        // Assign officer to department
        const updatedOfficer = await prisma.user.update({
            where: { id: officerId },
            data: {
                departmentId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
            },
        });

        res.status(200).json(updatedOfficer);
    });
}
