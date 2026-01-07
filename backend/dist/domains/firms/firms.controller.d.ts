import type { Request, Response, NextFunction } from 'express';
export declare class FirmsController {
    listPublic(_req: Request, res: Response, next: NextFunction): Promise<void>;
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    submitForReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    approve(req: Request, res: Response, next: NextFunction): Promise<void>;
    reject(req: Request, res: Response, next: NextFunction): Promise<void>;
    reactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
    suspend(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const firmsController: FirmsController;
//# sourceMappingURL=firms.controller.d.ts.map