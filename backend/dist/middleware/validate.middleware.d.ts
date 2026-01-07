import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
interface ValidateOptions {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}
export declare function validate(schemas: ValidateOptions): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map