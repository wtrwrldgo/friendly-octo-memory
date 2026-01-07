import { z } from 'zod';

// Region schemas
export const createRegionSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  isActive: z.boolean().default(true),
});

export const updateRegionSchema = createRegionSchema.partial();

export const regionIdSchema = z.object({
  id: z.string().uuid(),
});

// City schemas
export const createCitySchema = z.object({
  regionId: z.string().uuid(),
  name: z.string().min(2).max(100),
  isRegionCapital: z.boolean().default(false),
  isCountryCapital: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateCitySchema = createCitySchema.partial().omit({ regionId: true });

export const cityIdSchema = z.object({
  id: z.string().uuid(),
});

export const listCitiesQuerySchema = z.object({
  regionId: z.string().uuid().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
});

export type CreateRegionInput = z.infer<typeof createRegionSchema>;
export type UpdateRegionInput = z.infer<typeof updateRegionSchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
export type ListCitiesQuery = z.infer<typeof listCitiesQuerySchema>;
