import { z } from 'zod';

const urlOrPath = z.string().refine(
  (val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
  { message: 'Must be a valid URL or path starting with /' }
);

// Owner data for firm registration
export const ownerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(9).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

// Firm status enum matching Prisma schema
const firmStatusEnum = z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED']);

// Delivery fee type enum matching Prisma schema
const deliveryFeeTypeEnum = z.enum(['FIXED', 'PERCENTAGE']);

export const createFirmSchema = z.object({
  name: z.string().min(2).max(100),
  logoUrl: urlOrPath.optional().nullable(),
  homeBannerUrl: urlOrPath.optional().nullable(),
  detailBannerUrl: urlOrPath.optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  deliveryTime: z.string().max(50).optional().nullable(),
  minOrder: z.number().int().min(0).default(0),
  minOrderEnabled: z.boolean().default(false),
  deliveryFee: z.number().int().min(0).default(0),
  deliveryFeeEnabled: z.boolean().default(false),
  deliveryFeeType: deliveryFeeTypeEnum.default('FIXED'),
  deliveryFeePercent: z.number().int().min(0).max(100).default(0),
  bottleDeposit: z.number().int().min(0).default(5000),
  bottleDepositEnabled: z.boolean().default(false),
  bottleDepositPrice: z.number().int().min(0).default(15000),
  scheduleDaysLimit: z.number().int().min(2).max(7).default(7),
  scheduleTimeInterval: z.number().int().refine((v) => v === 15 || v === 30, {
    message: 'Time interval must be 15 or 30 minutes',
  }).default(30),
  isActive: z.boolean().default(true),
  // Optional owner data - if provided, creates owner staff member
  owner: ownerSchema.optional(),
});

// Update schema includes status workflow fields
export const updateFirmSchema = createFirmSchema.partial().extend({
  status: firmStatusEnum.optional(),
  isVisibleInClientApp: z.boolean().optional(),
  submittedAt: z.string().datetime().optional().nullable(),
  approvedAt: z.string().datetime().optional().nullable(),
  rejectionReason: z.string().max(500).optional().nullable(),
});

export const firmIdSchema = z.object({
  id: z.string().min(1).max(100),
});

export const listFirmsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  sortBy: z.enum(['name', 'createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateFirmInput = z.infer<typeof createFirmSchema>;
export type UpdateFirmInput = z.infer<typeof updateFirmSchema>;
export type ListFirmsQuery = z.infer<typeof listFirmsQuerySchema>;
