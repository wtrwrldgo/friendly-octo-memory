import { z } from 'zod';
export const staffLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
//# sourceMappingURL=auth.schema.js.map