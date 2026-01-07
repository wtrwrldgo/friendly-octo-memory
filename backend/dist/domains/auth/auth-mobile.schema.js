import { z } from 'zod';
// Phone number validation (Uzbekistan format: +998XXXXXXXXX)
const phoneRegex = /^\+998\d{9}$/;
export const sendCodeSchema = z.object({
    phone: z.string().regex(phoneRegex, 'Invalid phone number format. Use +998XXXXXXXXX'),
    role: z.enum(['client', 'driver']).optional(),
});
export const verifyCodeSchema = z.object({
    phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
    code: z.string().length(6, 'Code must be 6 digits'),
    deviceId: z.string().optional(),
    name: z.string().min(1).max(100).optional(),
    role: z.enum(['client', 'driver']).optional(),
});
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
export const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    language: z.enum(['uz', 'ru', 'en']).optional(),
});
//# sourceMappingURL=auth-mobile.schema.js.map