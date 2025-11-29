import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const protect = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new AppError('Not authorized, no token', 401));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error: any) {
        console.error('Token verification failed:', error.message);
        console.error('Received token:', token);
        return next(new AppError('Not authorized, token failed', 401));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes((req as any).user.role)) {
            return next(new AppError('Not authorized to access this route', 403));
        }
        next();
    };
};

// Alias for compatibility
export const authenticate = protect;
