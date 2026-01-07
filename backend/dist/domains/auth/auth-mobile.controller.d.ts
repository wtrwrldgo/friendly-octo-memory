import type { Request, Response, NextFunction } from 'express';
import type { SendCodeInput, VerifyCodeInput, RefreshTokenInput } from './auth-mobile.schema.js';
declare class AuthMobileController {
    sendCode(req: Request<object, object, SendCodeInput>, res: Response, next: NextFunction): Promise<void>;
    verifyCode(req: Request<object, object, VerifyCodeInput>, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request<object, object, RefreshTokenInput>, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request<object, object, RefreshTokenInput>, res: Response, next: NextFunction): Promise<void>;
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const authMobileController: AuthMobileController;
export {};
//# sourceMappingURL=auth-mobile.controller.d.ts.map