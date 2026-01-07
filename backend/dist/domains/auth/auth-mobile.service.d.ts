import { UserRole } from '@prisma/client';
import type { SendCodeInput, VerifyCodeInput, RefreshTokenInput, UpdateProfileInput } from './auth-mobile.schema.js';
interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
interface AuthResponse extends TokenPair {
    user: {
        id: string;
        phone: string;
        name: string | null;
        role: UserRole;
        language: string;
    };
    isNewUser: boolean;
}
type LoginRole = 'client' | 'driver';
declare class AuthMobileService {
    /**
     * Generate a 6-digit OTP code
     */
    private generateOtpCode;
    /**
     * Generate a secure refresh token
     */
    private generateRefreshToken;
    /**
     * Generate JWT access token
     */
    private generateAccessToken;
    /**
     * Send OTP code to phone number
     */
    sendCode(input: SendCodeInput): Promise<{
        message: string;
        expiresIn: number;
    }>;
    /**
     * Verify OTP code and return tokens
     */
    verifyCode(input: VerifyCodeInput): Promise<AuthResponse>;
    /**
     * Refresh access token using refresh token
     */
    refreshToken(input: RefreshTokenInput): Promise<TokenPair>;
    /**
     * Logout - invalidate refresh token
     */
    logout(refreshToken: string): Promise<void>;
    /**
     * Update user profile (updates ClientProfile for client role)
     */
    updateProfile(userId: string, input: UpdateProfileInput, role?: LoginRole): Promise<{
        id: string;
        phone: string;
        name: string | null;
        language: string;
    }>;
    /**
     * Get user profile (returns role-specific name)
     */
    getProfile(userId: string, role?: LoginRole): Promise<{
        id: string;
        phone: string;
        name: string;
        email: string | null | undefined;
        role: import(".prisma/client").$Enums.UserRole;
        language: string;
        createdAt: Date;
    }>;
}
export declare const authMobileService: AuthMobileService;
export {};
//# sourceMappingURL=auth-mobile.service.d.ts.map