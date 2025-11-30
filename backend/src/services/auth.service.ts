import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import { OTPService } from './otp.service';
import { TokenService } from './token.service';
import { AppError } from '../utils/AppError';
import { Role } from '@prisma/client';

export class AuthService {
    static async register(email: string, phone: string, password: string, name?: string, role: Role = Role.CITIZEN) {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
        });

        if (existingUser) {
            throw new AppError('User already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = OTPService.generateOTP();

        // In a real app, send OTP via Email/SMS here
        console.log(`Generated OTP for ${email}: ${otp}`);
        await OTPService.saveOTP(email, otp);

        const user = await prisma.user.create({
            data: {
                name: name || email.split('@')[0], // Use provided name or derive from email
                email,
                phone,
                password: hashedPassword,
                isVerified: role === Role.CITIZEN ? true : false, // Auto-verify citizens
                role,
            },
        });

        return { user, message: 'OTP sent to email' };
    }

    static async verifyAccount(email: string, otp: string) {
        const isValid = await OTPService.verifyOTP(email, otp);
        if (!isValid) {
            throw new AppError('Invalid or expired OTP', 400);
        }

        const user = await prisma.user.update({
            where: { email },
            data: { isVerified: true },
        });

        const tokens = TokenService.generateTokens({ id: user.id, role: user.role });
        return { user, token: tokens.accessToken, ...tokens };
    }

    static async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new AppError('Invalid credentials', 401);
        }

        if (!user.isVerified && (user.role === Role.ADMIN || user.role === Role.OFFICER)) {
            throw new AppError('Account not verified', 403);
        }

        // MFA for Admin/Officer
        if (user.role === Role.ADMIN || user.role === Role.OFFICER) {
            const otp = OTPService.generateOTP();
            console.log(`MFA OTP for ${email}: ${otp}`);
            await OTPService.saveOTP(email, otp);
            return { message: 'MFA OTP sent', mfaRequired: true };
        }

        const tokens = TokenService.generateTokens({ id: user.id, role: user.role });
        return { user, token: tokens.accessToken, ...tokens };
    }

    static async verifyMFA(email: string, otp: string) {
        const isValid = await OTPService.verifyOTP(email, otp);
        if (!isValid) {
            throw new AppError('Invalid or expired OTP', 400);
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const tokens = TokenService.generateTokens({ id: user.id, role: user.role });
        return { user, token: tokens.accessToken, ...tokens };
    }

    static async getUserProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isVerified: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    static async updateUserProfile(userId: string, updates: any) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: updates.name,
                phone: updates.phone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isVerified: true,
            },
        });

        return user;
    }
}
