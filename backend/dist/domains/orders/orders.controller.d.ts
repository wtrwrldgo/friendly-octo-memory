import type { Request, Response, NextFunction } from 'express';
export declare const ordersController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByUserId(req: Request, res: Response, next: NextFunction): Promise<void>;
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    acceptOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=orders.controller.d.ts.map