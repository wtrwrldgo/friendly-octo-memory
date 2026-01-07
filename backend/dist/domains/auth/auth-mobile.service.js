import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../infrastructure/database/prisma.js';
import { config } from '../../config/index.js';
import { BadRequestError } from '../../shared/errors/BadRequestError.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { UserRole } from '@prisma/client';
import { smsService } from '../../services/sms.service.js';
// OTP expires in 5 minutes
const OTP_EXPIRY_MINUTES = 5;
// Max OTP attempts before lockout
const MAX_OTP_ATTEMPTS = 5;
// Access token expires in 15 minutes
const ACCESS_TOKEN_EXPIRY = '15m';
// Refresh token expires in 30 days
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
class AuthMobileService {
    /**
     * Generate a 6-digit OTP code
     */
    generateOtpCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    /**
     * Generate a secure refresh token
     */
    generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }
    /**
     * Generate JWT access token
     */
    generateAccessToken(user) {
        return jwt.sign({
            id: user.id,
            phone: user.phone,
            role: user.role,
        }, config.jwt.secret, { expiresIn: ACCESS_TOKEN_EXPIRY });
    }
    /**
     * Send OTP code to phone number
     */
    async sendCode(input) {
        const { phone, role } = input;
        // If role is 'driver', check if the user exists and is a driver
        if (role === 'driver') {
            const existingUser = await prisma.users.findUnique({
                where: { phone },
            });
            if (!existingUser) {
                throw new BadRequestError('This phone number is not registered. Please contact your administrator to register as a driver.');
            }
            // Case-insensitive role check (database may have 'driver' or 'DRIVER')
            const userRole = existingUser.role?.toString().toUpperCase();
            if (userRole !== 'DRIVER') {
                throw new BadRequestError('This phone number is not registered as a driver. Please use the client app or contact support.');
            }
            if (!existingUser.is_active) {
                throw new BadRequestError('Your driver account is deactivated. Please contact support.');
            }
        }
        // Check for recent OTP requests (rate limiting)
        const recentOtp = await prisma.otp_codes.findFirst({
            where: {
                phone,
                created_at: {
                    gte: new Date(Date.now() - 60 * 1000), // Last 60 seconds
                },
            },
        });
        if (recentOtp) {
            const waitTime = Math.ceil((60 * 1000 - (Date.now() - recentOtp.created_at.getTime())) / 1000);
            throw new BadRequestError(`Please wait ${waitTime} seconds before requesting a new code. This helps protect your account.`);
        }
        // Delete any existing unverified OTP codes for this phone
        await prisma.otp_codes.deleteMany({
            where: {
                phone,
                verified: false,
            },
        });
        // Generate new OTP code
        const code = this.generateOtpCode();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        // Store OTP in database
        await prisma.otp_codes.create({
            data: {
                phone,
                code,
                expires_at: expiresAt,
            },
        });
        // Send SMS via Eskiz.uz
        try {
            await smsService.sendOtp(phone, code);
            console.log(`[SMS] OTP sent to ${phone}`);
        }
        catch (smsError) {
            console.error(`[SMS] Failed to send OTP to ${phone}:`, smsError);
            // In development, continue even if SMS fails
            if (!config.isDevelopment) {
                throw new BadRequestError('Failed to send verification code. Please try again.');
            }
        }
        // Log code in development for debugging
        if (config.isDevelopment) {
            console.log(`[DEV] OTP Code for ${phone}: ${code}`);
        }
        return {
            message: 'Verification code sent',
            expiresIn: OTP_EXPIRY_MINUTES * 60,
            ...(config.isDevelopment ? { code } : {}),
        };
    }
    /**
     * Verify OTP code and return tokens
     */
    async verifyCode(input) {
        const { phone, code, deviceId, name, role } = input;
        // Find the latest OTP for this phone
        const otpRecord = await prisma.otp_codes.findFirst({
            where: {
                phone,
                verified: false,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        if (!otpRecord) {
            throw new BadRequestError('No verification code found. Please request a new code.');
        }
        // Check if OTP is expired
        if (otpRecord.expires_at < new Date()) {
            throw new BadRequestError('Verification code has expired. Please request a new code.');
        }
        // Check attempt limit
        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            throw new BadRequestError('Too many attempts. Please request a new code.');
        }
        // Increment attempts
        await prisma.otp_codes.update({
            where: { id: otpRecord.id },
            data: { attempts: otpRecord.attempts + 1 },
        });
        // Verify code
        if (otpRecord.code !== code) {
            throw new BadRequestError('Invalid verification code');
        }
        // Mark OTP as verified
        await prisma.otp_codes.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        });
        // Find or create user with role-specific profiles
        let user = await prisma.users.findUnique({
            where: { phone },
            include: {
                client_profiles: true,
                drivers: true,
            },
        });
        const isNewUser = !user;
        const loginRole = role || 'client';
        // For driver role, user must exist and have a driver profile
        if (loginRole === 'driver') {
            if (!user) {
                throw new BadRequestError('This phone number is not registered as a driver.');
            }
            if (!user.drivers) {
                throw new BadRequestError('This account is not registered as a driver.');
            }
        }
        // For client role or no role specified, create user if not exists
        if (!user) {
            user = await prisma.users.create({
                data: {
                    phone,
                    role: UserRole.CLIENT,
                    language: 'uz',
                    updated_at: new Date(),
                    // Create ClientProfile with the provided name
                    client_profiles: {
                        create: {
                            name: name || 'User',
                            updated_at: new Date(),
                        },
                    },
                },
                include: {
                    client_profiles: true,
                    drivers: true,
                },
            });
        }
        else if (loginRole === 'client' && !user.client_profiles) {
            // Existing user logging in as client but has no ClientProfile
            // This handles the case where a driver account exists but no client profile
            await prisma.client_profiles.create({
                data: {
                    user_id: user.id,
                    name: name || 'User',
                    updated_at: new Date(),
                },
            });
            // Refresh user with the new profile
            user = await prisma.users.findUnique({
                where: { phone },
                include: {
                    client_profiles: true,
                    drivers: true,
                },
            });
            if (!user)
                throw new BadRequestError('User not found');
        }
        // Check if user is active
        if (!user.is_active) {
            throw new UnauthorizedError('Account is deactivated');
        }
        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken();
        // Store refresh token
        await prisma.refresh_tokens.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                device_id: deviceId,
                expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            },
        });
        // Return role-specific name based on login context
        const profileName = loginRole === 'driver'
            ? user.drivers?.name
            : user.client_profiles?.name;
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                phone: user.phone,
                name: profileName || 'User',
                role: user.role,
                language: user.language,
            },
            isNewUser,
        };
    }
    /**
     * Refresh access token using refresh token
     */
    async refreshToken(input) {
        const { refreshToken } = input;
        // Find refresh token
        const tokenRecord = await prisma.refresh_tokens.findUnique({
            where: { token: refreshToken },
            include: { users: true },
        });
        if (!tokenRecord) {
            throw new UnauthorizedError('Invalid refresh token');
        }
        // Check if token is expired
        if (tokenRecord.expires_at < new Date()) {
            // Delete expired token
            await prisma.refresh_tokens.delete({
                where: { id: tokenRecord.id },
            });
            throw new UnauthorizedError('Refresh token has expired');
        }
        // Check if user is active
        if (!tokenRecord.users.is_active) {
            throw new UnauthorizedError('Account is deactivated');
        }
        // Generate new access token
        const accessToken = this.generateAccessToken(tokenRecord.users);
        // Rotate refresh token
        const newRefreshToken = this.generateRefreshToken();
        await prisma.refresh_tokens.update({
            where: { id: tokenRecord.id },
            data: {
                token: newRefreshToken,
                expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    /**
     * Logout - invalidate refresh token
     */
    async logout(refreshToken) {
        await prisma.refresh_tokens.deleteMany({
            where: { token: refreshToken },
        });
    }
    /**
     * Update user profile (updates ClientProfile for client role)
     */
    async updateProfile(userId, input, role = 'client') {
        // Update language on User (shared)
        if (input.language) {
            await prisma.users.update({
                where: { id: userId },
                data: { language: input.language, updated_at: new Date() },
            });
        }
        // Update name on role-specific profile
        if (input.name) {
            if (role === 'client') {
                await prisma.client_profiles.upsert({
                    where: { user_id: userId },
                    update: { name: input.name, updated_at: new Date() },
                    create: { user_id: userId, name: input.name, updated_at: new Date() },
                });
            }
            else if (role === 'driver') {
                await prisma.drivers.updateMany({
                    where: { user_id: userId },
                    data: { name: input.name, updated_at: new Date() },
                });
            }
        }
        // Return updated profile
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                client_profiles: true,
                drivers: true,
            },
        });
        if (!user)
            throw new UnauthorizedError('User not found');
        const profileName = role === 'driver'
            ? user.drivers?.name
            : user.client_profiles?.name;
        return {
            id: user.id,
            phone: user.phone,
            name: profileName || null,
            language: user.language,
        };
    }
    /**
     * Get user profile (returns role-specific name)
     */
    async getProfile(userId, role = 'client') {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                client_profiles: true,
                drivers: true,
            },
        });
        if (!user) {
            throw new UnauthorizedError('User not found');
        }
        // Return role-specific profile data
        const profileName = role === 'driver'
            ? user.drivers?.name
            : user.client_profiles?.name;
        const profileEmail = role === 'driver'
            ? null
            : user.client_profiles?.email;
        return {
            id: user.id,
            phone: user.phone,
            name: profileName || 'User',
            email: profileEmail,
            role: user.role,
            language: user.language,
            createdAt: user.created_at,
        };
    }
}
export const authMobileService = new AuthMobileService();
//# sourceMappingURL=auth-mobile.service.js.map