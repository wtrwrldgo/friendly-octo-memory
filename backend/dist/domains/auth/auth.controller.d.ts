import type { Request, Response, NextFunction } from 'express';
import type { StaffLoginInput } from './auth.schema.js';
declare class AuthController {
    staffLogin(req: Request<object, object, StaffLoginInput>, res: Response, next: NextFunction): Promise<void>;
    driverLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    adminLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=auth.controller.d.ts.map