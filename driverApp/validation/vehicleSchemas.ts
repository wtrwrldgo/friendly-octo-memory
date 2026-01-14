import { z } from 'zod';

/**
 * Schema for vehicle information update
 */
export const vehicleSchema = z.object({
  vehicle_model: z
    .string()
    .min(2, 'Vehicle model must be at least 2 characters')
    .max(100, 'Vehicle model must not exceed 100 characters'),
  vehicle_number: z
    .string()
    .min(5, 'Vehicle number must be at least 5 characters')
    .max(20, 'Vehicle number must not exceed 20 characters')
    .regex(/^[A-Z0-9\s]+$/i, 'Vehicle number can only contain letters, numbers, and spaces'),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
