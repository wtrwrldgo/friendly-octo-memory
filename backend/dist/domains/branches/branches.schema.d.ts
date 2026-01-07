import { z } from 'zod';
export declare const createBranchSchema: z.ZodObject<{
    firmId: z.ZodString;
    cityId: z.ZodString;
    name: z.ZodString;
    isHeadquarters: z.ZodDefault<z.ZodBoolean>;
    deliveryFee: z.ZodDefault<z.ZodNumber>;
    etaMinutes: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    firmId: string;
    name: string;
    deliveryFee: number;
    isActive: boolean;
    cityId: string;
    isHeadquarters: boolean;
    etaMinutes: number;
}, {
    firmId: string;
    name: string;
    cityId: string;
    deliveryFee?: number | undefined;
    isActive?: boolean | undefined;
    isHeadquarters?: boolean | undefined;
    etaMinutes?: number | undefined;
}>;
export declare const updateBranchSchema: z.ZodObject<Omit<{
    firmId: z.ZodOptional<z.ZodString>;
    cityId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    isHeadquarters: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deliveryFee: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    etaMinutes: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "firmId">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    deliveryFee?: number | undefined;
    isActive?: boolean | undefined;
    cityId?: string | undefined;
    isHeadquarters?: boolean | undefined;
    etaMinutes?: number | undefined;
}, {
    name?: string | undefined;
    deliveryFee?: number | undefined;
    isActive?: boolean | undefined;
    cityId?: string | undefined;
    isHeadquarters?: boolean | undefined;
    etaMinutes?: number | undefined;
}>;
export declare const branchIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const listBranchesQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    firmId: z.ZodOptional<z.ZodString>;
    cityId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean | undefined, string | undefined>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "createdAt", "deliveryFee"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "name" | "deliveryFee" | "createdAt";
    sortOrder: "asc" | "desc";
    firmId?: string | undefined;
    isActive?: boolean | undefined;
    cityId?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    firmId?: string | undefined;
    isActive?: string | undefined;
    sortBy?: "name" | "deliveryFee" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    cityId?: string | undefined;
}>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type ListBranchesQuery = z.infer<typeof listBranchesQuerySchema>;
//# sourceMappingURL=branches.schema.d.ts.map