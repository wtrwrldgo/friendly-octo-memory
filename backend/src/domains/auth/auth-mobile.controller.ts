import type { Request, Response, NextFunction } from 'express';
import { authMobileService } from './auth-mobile.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
import type {
  SendCodeInput,
  VerifyCodeInput,
  RefreshTokenInput,
  UpdateProfileInput,
} from './auth-mobile.schema.js';

class AuthMobileController {
  async sendCode(
    req: Request<object, object, SendCodeInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authMobileService.sendCode(req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async verifyCode(
    req: Request<object, object, VerifyCodeInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authMobileService.verifyCode(req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: Request<object, object, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authMobileService.refreshToken(req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(
    req: Request<object, object, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await authMobileService.logout(req.body.refreshToken);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const result = await authMobileService.getProfile(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const result = await authMobileService.updateProfile(
        userId,
        req.body as UpdateProfileInput
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const authMobileController = new AuthMobileController();
