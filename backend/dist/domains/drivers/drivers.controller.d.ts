import type { Request, Response, NextFunction } from 'express';
export declare const driversController: {
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateLocation(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=drivers.controller.d.ts.map