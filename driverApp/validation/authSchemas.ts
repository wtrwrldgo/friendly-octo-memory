import { z } from 'zod';

/**
 * Schema for phone number input (9 digits for +998 prefix)
 */
export const phoneSchema = z.object({
  phone: z
    .string()
    .length(9, 'Phone number must be exactly 9 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

/**
 * Schema for verification code input (4 digits)
 */
export const verificationCodeSchema = z.object({
  code: z
    .string()
    .length(4, 'Verification code must be exactly 4 digits')
    .regex(/^\d+$/, 'Code must contain only digits'),
});

export type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>;

/**
 * Combined schema for login flow (phone + code)
 */
export const loginSchema = z.object({
  phone: z
    .string()
    .length(9, 'Phone number must be exactly 9 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  code: z
    .string()
    .length(4, 'Verification code must be exactly 4 digits')
    .regex(/^\d+$/, 'Code must contain only digits'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
