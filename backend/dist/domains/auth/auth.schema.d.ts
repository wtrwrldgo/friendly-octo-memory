import { z } from 'zod';
export declare const staffLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
//# sourceMappingURL=auth.schema.d.ts.map