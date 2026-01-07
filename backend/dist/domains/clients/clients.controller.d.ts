import type { Request, Response, NextFunction } from 'express';
export declare const clientsController: {
    /**
     * List clients with firm isolation.
     *
     * Query params:
     * - firmId: Required for firm staff. Only returns clients who ordered from this firm.
     * - branchId: Optional. Further filter by branch.
     * - includeGlobal: Only for WaterGo Super Admin. Set to "true" to get all clients.
     */
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get single client by ID with firm isolation.
     *
     * Query params:
     * - firmId: If provided, only return client if they have ordered from this firm,
     *           and only show orders from this firm.
     */
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=clients.controller.d.ts.map