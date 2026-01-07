import { z } from 'zod';
export declare const createRegionSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    isActive: boolean;
}, {
    code: string;
    name: string;
    isActive?: boolean | undefined;
}>;
export declare const updateRegionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
}, {
    code?: string | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const regionIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const createCitySchema: z.ZodObject<{
    regionId: z.ZodString;
    name: z.ZodString;
    isRegionCapital: z.ZodDefault<z.ZodBoolean>;
    isCountryCapital: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    regionId: string;
    isRegionCapital: boolean;
    isCountryCapital: boolean;
}, {
    name: string;
    regionId: string;
    isActive?: boolean | undefined;
    isRegionCapital?: boolean | undefined;
    isCountryCapital?: boolean | undefined;
}>;
export declare const updateCitySchema: z.ZodObject<Omit<{
    regionId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    isRegionCapital: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isCountryCapital: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "regionId">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    isRegionCapital?: boolean | undefined;
    isCountryCapital?: boolean | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    isRegionCapital?: boolean | undefined;
    isCountryCapital?: boolean | undefined;
}>;
export declare const cityIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const listCitiesQuerySchema: z.ZodObject<{
    regionId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    regionId?: string | undefined;
}, {
    isActive?: string | undefined;
    regionId?: string | undefined;
}>;
export type CreateRegionInput = z.infer<typeof createRegionSchema>;
export type UpdateRegionInput = z.infer<typeof updateRegionSchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
export type ListCitiesQuery = z.infer<typeof listCitiesQuerySchema>;
//# sourceMappingURL=geography.schema.d.ts.map