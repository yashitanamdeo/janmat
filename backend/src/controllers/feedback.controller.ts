import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

const createFeedbackSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

export class FeedbackController {
    // Submit feedback for a resolved complaint (Citizen only)
    static submitFeedback = catchAsync(async (req: Request, res: Response) => {
        const { id: complaintId } = req.params;
        const userId = (req as any).user.id;
        const { rating, comment } = createFeedbackSchema.parse(req.body);

        // Check if complaint exists and belongs to the user
        const complaint = await prisma.complaint.findUnique({
            where: { id: complaintId },
        });

        if (!complaint) {
            throw new AppError('Complaint not found', 404);
        }

        if (complaint.userId !== userId) {
            throw new AppError('You can only provide feedback for your own complaints', 403);
        }

        // Check if complaint is resolved
        if (complaint.status !== 'RESOLVED') {
            throw new AppError('Feedback can only be provided for resolved complaints', 400);
        }

        // Check if feedback already exists
        const existingFeedback = await prisma.feedback.findUnique({
            where: { complaintId },
        });

        if (existingFeedback) {
            throw new AppError('Feedback already submitted for this complaint', 400);
        }

        // Create feedback
        const feedback = await prisma.feedback.create({
            data: {
                complaintId,
                userId,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                complaint: {
                    select: {
                        id: true,
                        title: true,
                        assignedOfficer: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json(feedback);
    });

    // Get feedback for a specific complaint
    static getFeedback = catchAsync(async (req: Request, res: Response) => {
        const { id: complaintId } = req.params;

        const feedback = await prisma.feedback.findUnique({
            where: { complaintId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!feedback) {
            return res.status(404).json({ message: 'No feedback found for this complaint' });
        }

        res.status(200).json(feedback);
    });

    // Get all feedbacks (Admin/Officer)
    static getAllFeedbacks = catchAsync(async (req: Request, res: Response) => {
        const userRole = (req as any).user.role;
        const userId = (req as any).user.id;

        let whereClause: any = {};

        // If officer, only show feedbacks for their assigned complaints
        if (userRole === 'OFFICER') {
            whereClause = {
                complaint: {
                    assignedTo: userId,
                },
            };
        }

        const feedbacks = await prisma.feedback.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                complaint: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        assignedOfficer: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        department: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json(feedbacks);
    });

    // Get feedback statistics
    static getFeedbackStats = catchAsync(async (req: Request, res: Response) => {
        const userRole = (req as any).user.role;
        const userId = (req as any).user.id;

        let whereClause: any = {};

        // If officer, only show stats for their assigned complaints
        if (userRole === 'OFFICER') {
            whereClause = {
                complaint: {
                    assignedTo: userId,
                },
            };
        }

        const feedbacks = await prisma.feedback.findMany({
            where: whereClause,
            select: {
                rating: true,
            },
        });

        const totalFeedbacks = feedbacks.length;
        const averageRating = totalFeedbacks > 0
            ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
            : 0;

        const ratingDistribution = {
            1: feedbacks.filter(f => f.rating === 1).length,
            2: feedbacks.filter(f => f.rating === 2).length,
            3: feedbacks.filter(f => f.rating === 3).length,
            4: feedbacks.filter(f => f.rating === 4).length,
            5: feedbacks.filter(f => f.rating === 5).length,
        };

        res.status(200).json({
            totalFeedbacks,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
        });
    });

    // Update feedback (allow users to edit their feedback)
    static updateFeedback = catchAsync(async (req: Request, res: Response) => {
        const { id: complaintId } = req.params;
        const userId = (req as any).user.id;
        const { rating, comment } = createFeedbackSchema.parse(req.body);

        // Check if feedback exists and belongs to the user
        const existingFeedback = await prisma.feedback.findUnique({
            where: { complaintId },
        });

        if (!existingFeedback) {
            throw new AppError('Feedback not found', 404);
        }

        if (existingFeedback.userId !== userId) {
            throw new AppError('You can only update your own feedback', 403);
        }

        // Update feedback
        const feedback = await prisma.feedback.update({
            where: { complaintId },
            data: {
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        res.status(200).json(feedback);
    });
}
