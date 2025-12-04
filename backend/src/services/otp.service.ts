import redis from '../config/redis';
import crypto from 'crypto';

export class OTPService {
    private static readonly OTP_EXPIRY = 300; // 5 minutes

    static generateOTP(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    static async saveOTP(key: string, otp: string): Promise<void> {
        await redis.set(`otp:${key}`, otp, 'EX', this.OTP_EXPIRY);
    }

    static async verifyOTP(key: string, otp: string): Promise<boolean> {
        const storedOTP = await redis.get(`otp:${key}`);
        if (storedOTP === otp) {
            await redis.del(`otp:${key}`);
            return true;
        }
        return false;
    }
}
