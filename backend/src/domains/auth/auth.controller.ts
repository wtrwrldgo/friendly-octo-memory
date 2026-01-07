import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
import type { StaffLoginInput } from './auth.schema.js';

class AuthController {
  async staffLogin(
    req: Request<object, object, StaffLoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.staffLogin(req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async driverLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.driverLogin(req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.adminLogin(req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
