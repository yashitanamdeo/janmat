import { Request, Response } from 'express';
import { ComplaintService } from '../services/complaint.service';
import catchAsync from '../utils/catchAsync';
import { z } from 'zod';
import { Status } from '@prisma/client';

const updateStatusSchema = z.object({
    status: z.nativeEnum(Status),
    comment: z.string().optional(),
});

export class OfficerController {
    static getAssignedComplaints = catchAsync(async (req: Request, res: Response) => {
        const officerId = (req as any).user.id;
        const complaints = await ComplaintService.getAssignedComplaints(officerId);
        res.status(200).json(complaints);
    });

    static updateComplaintStatus = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, comment = 'Status updated' } = updateStatusSchema.parse(req.body);
        const officerId = (req as any).user.id;

        const complaint = await ComplaintService.updateStatus(id, status, comment, officerId);
        res.status(200).json(complaint);
    });
}
