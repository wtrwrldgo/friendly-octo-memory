import { z } from 'zod';

/**
 * Schema for driver name update
 */
export const driverNameSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\u0400-\u04FF]+$/, 'Name can only contain letters and spaces'),
});

export type DriverNameFormData = z.infer<typeof driverNameSchema>;

/**
 * Schema for driver district update
 */
export const driverDistrictSchema = z.object({
  district: z
    .string()
    .min(1, 'District is required')
    .max(100, 'District name is too long'),
});

export type DriverDistrictFormData = z.infer<typeof driverDistrictSchema>;

/**
 * Combined profile schema (for full profile edit)
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\u0400-\u04FF]+$/, 'Name can only contain letters and spaces'),
  district: z
    .string()
    .min(1, 'District is required')
    .max(100, 'District name is too long'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
