import type { Request, Response, NextFunction } from 'express';
export declare const pushTokensController: {
    /**
     * Register a push token for the authenticated user
     * POST /api/push-tokens
     * Body: { token: string, platform: 'ios' | 'android' }
     */
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Unregister a push token
     * DELETE /api/push-tokens
     * Body: { token: string }
     */
    unregister(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=push-tokens.controller.d.ts.map