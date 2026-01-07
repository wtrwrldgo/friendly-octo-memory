import type { Request, Response, NextFunction } from 'express';
import { firmsService } from './firms.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
import type { CreateFirmInput, UpdateFirmInput, ListFirmsQuery } from './firms.schema.js';

export class FirmsController {
  // Public endpoint for client app - only returns visible firms
  async listPublic(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const firms = await firmsService.listPublic();
      sendSuccess(res, firms);
    } catch (error) {
      next(error);
    }
  }

  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as ListFirmsQuery;
      const { firms, total } = await firmsService.list(query);
      sendPaginated(res, firms, query.page, query.limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const firm = await firmsService.getById(id);
      sendSuccess(res, firm);
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await firmsService.create(req.body as CreateFirmInput);
      // Return firm and owner (without passwordHash)
      const responseData: any = { ...result.firm };
      if (result.owner) {
        const { passwordHash, ...ownerWithoutPassword } = result.owner as any;
        responseData.owner = ownerWithoutPassword;
      }
      sendSuccess(res, responseData, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const user = (req as any).user;
      // Pass user firmId for ownership verification
      // WATERGO_ADMIN can update any firm, others can only update their own
      const firmId = user?.role === 'WATERGO_ADMIN' ? undefined : user?.firmId;
      const firm = await firmsService.update(id, req.body as UpdateFirmInput, firmId);
      sendSuccess(res, firm);
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      await firmsService.delete(id);
      sendSuccess(res, { message: 'Firm deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async submitForReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const user = (req as any).user;
      const firm = await firmsService.submitForReview(id, user.firmId);
      sendSuccess(res, firm);
    } catch (error) {
      next(error);
    }
  }

  async approve(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const firm = await firmsService.approve(id);
      sendSuccess(res, firm);
    } catch (error) {
      next(error);
    }
  }

  async reject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { reason } = req.body as { reason: string };
      if (!reason) {
        res.status(400).json({ success: false, message: 'Rejection reason is required' });
        return;
      }
      const firm = await firmsService.reject(id, reason);
      sendSuccess(res, firm);
    } catch (error) {
      next(error);
    }
  }

  async reactivate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const firm = await firmsService.reactivate(id);
      sendSuccess(res, firm);
    } catch (error) {
      next(error);
    }
  }

  async suspend(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const firm = await firmsService.suspend(id);
      sendSuccess(res, firm);
    } catch (error) {
      next(error);
    }
  }
}

export const firmsController = new FirmsController();
