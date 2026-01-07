import { z } from 'zod';
export declare const sendCodeSchema: z.ZodObject<{
    phone: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["client", "driver"]>>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    role?: "client" | "driver" | undefined;
}, {
    phone: string;
    role?: "client" | "driver" | undefined;
}>;
export declare const verifyCodeSchema: z.ZodObject<{
    phone: z.ZodString;
    code: z.ZodString;
    deviceId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["client", "driver"]>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    phone: string;
    role?: "client" | "driver" | undefined;
    name?: string | undefined;
    deviceId?: string | undefined;
}, {
    code: string;
    phone: string;
    role?: "client" | "driver" | undefined;
    name?: string | undefined;
    deviceId?: string | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<["uz", "ru", "en"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    language?: "uz" | "ru" | "en" | undefined;
}, {
    name?: string | undefined;
    language?: "uz" | "ru" | "en" | undefined;
}>;
export type SendCodeInput = z.infer<typeof sendCodeSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
//# sourceMappingURL=auth-mobile.schema.d.ts.map