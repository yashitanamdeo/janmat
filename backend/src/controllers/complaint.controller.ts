import { Request, Response } from 'express';
import { ComplaintService } from '../services/complaint.service';
import catchAsync from '../utils/catchAsync';
import { z } from 'zod';
import { Status } from '@prisma/client';
import prisma from '../config/db';

const createComplaintSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    location: z.string().optional(),
    latitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    longitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    departmentId: z.string().optional(),
});

const updateStatusSchema = z.object({
    status: z.nativeEnum(Status),
    comment: z.string().min(1),
});

export class ComplaintController {
    static create = catchAsync(async (req: Request, res: Response) => {
        // Parse body data (multipart/form-data sends fields as strings, so we might need to parse JSON if complex)
        // For simplicity, we assume simple fields. If location is JSON, parse it.
        const body = req.body;
        const files = req.files as Express.Multer.File[];
        const userId = (req as any).user.id;

        const validatedData = createComplaintSchema.parse(body);

        const complaint = await ComplaintService.createComplaint(userId, validatedData, files || []);
        res.status(201).json(complaint);
    });

    static getMyComplaints = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const complaints = await ComplaintService.getMyComplaints(userId);
        res.status(200).json(complaints);
    });

    static updateStatus = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, comment } = updateStatusSchema.parse(req.body);
        const updatedBy = (req as any).user.name; // In real app, check if user is officer/admin

        const complaint = await ComplaintService.updateStatus(id, status, comment, updatedBy);
        res.status(200).json(complaint);
    });

    static getComplaint = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const complaint = await prisma.complaint.findUnique({
            where: { id },
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
                },
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
        });
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.status(200).json(complaint);
    });

    static updateComplaint = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const complaint = await ComplaintService.updateComplaint(id, userId, req.body);
        res.status(200).json(complaint);
    });

    static deleteComplaint = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user.id;
        await ComplaintService.deleteComplaint(id, userId);
        res.status(200).json({ message: 'Complaint deleted successfully' });
    });
}
