import { z } from 'zod';
export declare const ownerSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    phone: string;
    name: string;
    password: string;
}, {
    email: string;
    phone: string;
    name: string;
    password: string;
}>;
export declare const createFirmSchema: z.ZodObject<{
    name: z.ZodString;
    logoUrl: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    homeBannerUrl: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    detailBannerUrl: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    deliveryTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    minOrder: z.ZodDefault<z.ZodNumber>;
    minOrderEnabled: z.ZodDefault<z.ZodBoolean>;
    deliveryFee: z.ZodDefault<z.ZodNumber>;
    deliveryFeeEnabled: z.ZodDefault<z.ZodBoolean>;
    deliveryFeeType: z.ZodDefault<z.ZodEnum<["FIXED", "PERCENTAGE"]>>;
    deliveryFeePercent: z.ZodDefault<z.ZodNumber>;
    bottleDeposit: z.ZodDefault<z.ZodNumber>;
    bottleDepositEnabled: z.ZodDefault<z.ZodBoolean>;
    bottleDepositPrice: z.ZodDefault<z.ZodNumber>;
    scheduleDaysLimit: z.ZodDefault<z.ZodNumber>;
    scheduleTimeInterval: z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    owner: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        phone: string;
        name: string;
        password: string;
    }, {
        email: string;
        phone: string;
        name: string;
        password: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    minOrder: number;
    minOrderEnabled: boolean;
    deliveryFee: number;
    deliveryFeeEnabled: boolean;
    deliveryFeeType: "FIXED" | "PERCENTAGE";
    deliveryFeePercent: number;
    bottleDeposit: number;
    bottleDepositEnabled: boolean;
    bottleDepositPrice: number;
    scheduleDaysLimit: number;
    scheduleTimeInterval: number;
    isActive: boolean;
    logoUrl?: string | null | undefined;
    homeBannerUrl?: string | null | undefined;
    detailBannerUrl?: string | null | undefined;
    description?: string | null | undefined;
    address?: string | null | undefined;
    deliveryTime?: string | null | undefined;
    owner?: {
        email: string;
        phone: string;
        name: string;
        password: string;
    } | undefined;
}, {
    name: string;
    logoUrl?: string | null | undefined;
    homeBannerUrl?: string | null | undefined;
    detailBannerUrl?: string | null | undefined;
    description?: string | null | undefined;
    address?: string | null | undefined;
    deliveryTime?: string | null | undefined;
    minOrder?: number | undefined;
    minOrderEnabled?: boolean | undefined;
    deliveryFee?: number | undefined;
    deliveryFeeEnabled?: boolean | undefined;
    deliveryFeeType?: "FIXED" | "PERCENTAGE" | undefined;
    deliveryFeePercent?: number | undefined;
    bottleDeposit?: number | undefined;
    bottleDepositEnabled?: boolean | undefined;
    bottleDepositPrice?: number | undefined;
    scheduleDaysLimit?: number | undefined;
    scheduleTimeInterval?: number | undefined;
    isActive?: boolean | undefined;
    owner?: {
        email: string;
        phone: string;
        name: string;
        password: string;
    } | undefined;
}>;
export declare const updateFirmSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>>;
    homeBannerUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>>;
    detailBannerUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    deliveryTime: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    minOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    minOrderEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deliveryFee: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    deliveryFeeEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deliveryFeeType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["FIXED", "PERCENTAGE"]>>>;
    deliveryFeePercent: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    bottleDeposit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    bottleDepositEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    bottleDepositPrice: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    scheduleDaysLimit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    scheduleTimeInterval: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    owner: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        phone: string;
        name: string;
        password: string;
    }, {
        email: string;
        phone: string;
        name: string;
        password: string;
    }>>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PENDING_REVIEW", "ACTIVE", "SUSPENDED"]>>;
    isVisibleInClientApp: z.ZodOptional<z.ZodBoolean>;
    submittedAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    approvedAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    rejectionReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | undefined;
    name?: string | undefined;
    logoUrl?: string | null | undefined;
    homeBannerUrl?: string | null | undefined;
    detailBannerUrl?: string | null | undefined;
    description?: string | null | undefined;
    address?: string | null | undefined;
    deliveryTime?: string | null | undefined;
    minOrder?: number | undefined;
    minOrderEnabled?: boolean | undefined;
    deliveryFee?: number | undefined;
    deliveryFeeEnabled?: boolean | undefined;
    deliveryFeeType?: "FIXED" | "PERCENTAGE" | undefined;
    deliveryFeePercent?: number | undefined;
    bottleDeposit?: number | undefined;
    bottleDepositEnabled?: boolean | undefined;
    bottleDepositPrice?: number | undefined;
    scheduleDaysLimit?: number | undefined;
    scheduleTimeInterval?: number | undefined;
    isActive?: boolean | undefined;
    owner?: {
        email: string;
        phone: string;
        name: string;
        password: string;
    } | undefined;
    isVisibleInClientApp?: boolean | undefined;
    submittedAt?: string | null | undefined;
    approvedAt?: string | null | undefined;
    rejectionReason?: string | null | undefined;
}, {
    status?: "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | undefined;
    name?: string | undefined;
    logoUrl?: string | null | undefined;
    homeBannerUrl?: string | null | undefined;
    detailBannerUrl?: string | null | undefined;
    description?: string | null | undefined;
    address?: string | null | undefined;
    deliveryTime?: string | null | undefined;
    minOrder?: number | undefined;
    minOrderEnabled?: boolean | undefined;
    deliveryFee?: number | undefined;
    deliveryFeeEnabled?: boolean | undefined;
    deliveryFeeType?: "FIXED" | "PERCENTAGE" | undefined;
    deliveryFeePercent?: number | undefined;
    bottleDeposit?: number | undefined;
    bottleDepositEnabled?: boolean | undefined;
    bottleDepositPrice?: number | undefined;
    scheduleDaysLimit?: number | undefined;
    scheduleTimeInterval?: number | undefined;
    isActive?: boolean | undefined;
    owner?: {
        email: string;
        phone: string;
        name: string;
        password: string;
    } | undefined;
    isVisibleInClientApp?: boolean | undefined;
    submittedAt?: string | null | undefined;
    approvedAt?: string | null | undefined;
    rejectionReason?: string | null | undefined;
}>;
export declare const firmIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const listFirmsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean | undefined, string | undefined>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "createdAt", "rating"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "name" | "createdAt" | "rating";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    isActive?: boolean | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    isActive?: string | undefined;
    sortBy?: "name" | "createdAt" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type CreateFirmInput = z.infer<typeof createFirmSchema>;
export type UpdateFirmInput = z.infer<typeof updateFirmSchema>;
export type ListFirmsQuery = z.infer<typeof listFirmsQuerySchema>;
//# sourceMappingURL=firms.schema.d.ts.map