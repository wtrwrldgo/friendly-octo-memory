import type { Request, Response, NextFunction } from 'express';
interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    keyPrefix?: string;
    skipFailedRequests?: boolean;
}
export declare function rateLimit(options: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const apiLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const strictLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=rateLimit.middleware.d.ts.map