import { z } from 'zod';
export const createBranchSchema = z.object({
    firmId: z.string().uuid(),
    cityId: z.string().uuid(),
    name: z.string().min(2).max(100),
    isHeadquarters: z.boolean().default(false),
    deliveryFee: z.number().int().min(0).default(0),
    etaMinutes: z.number().int().min(1).max(480).default(30),
    isActive: z.boolean().default(true),
});
export const updateBranchSchema = createBranchSchema.partial().omit({ firmId: true });
export const branchIdSchema = z.object({
    id: z.string().uuid(),
});
export const listBranchesQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    firmId: z.string().uuid().optional(),
    cityId: z.string().uuid().optional(),
    isActive: z
        .string()
        .optional()
        .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    sortBy: z.enum(['name', 'createdAt', 'deliveryFee']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
//# sourceMappingURL=branches.schema.js.map