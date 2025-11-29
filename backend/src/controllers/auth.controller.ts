import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import catchAsync from '../utils/catchAsync';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const verifySchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

export class AuthController {
    static register = catchAsync(async (req: Request, res: Response) => {
        const { name, email, phone, password } = registerSchema.parse(req.body);
        const result = await AuthService.register(email, phone, password, name);
        res.status(201).json(result);
    });

    static verify = catchAsync(async (req: Request, res: Response) => {
        const { email, otp } = verifySchema.parse(req.body);
        const result = await AuthService.verifyAccount(email, otp);
        res.status(200).json(result);
    });

    static login = catchAsync(async (req: Request, res: Response) => {
        const { email, password } = loginSchema.parse(req.body);
        const result = await AuthService.login(email, password);
        res.status(200).json(result);
    });

    static getProfile = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const user = await AuthService.getUserProfile(userId);
        res.status(200).json(user);
    });

    static updateProfile = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const updates = req.body;
        const user = await AuthService.updateUserProfile(userId, updates);
        res.status(200).json(user);
    });
}
