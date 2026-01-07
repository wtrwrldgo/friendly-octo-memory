import type { Request, Response, NextFunction } from 'express';
import { branchesService } from './branches.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
import type { CreateBranchInput, UpdateBranchInput, ListBranchesQuery } from './branches.schema.js';

export class BranchesController {
  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as ListBranchesQuery;
      const { branches, total } = await branchesService.list(query);
      sendPaginated(res, branches, query.page, query.limit, total);
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
      const branch = await branchesService.getById(id);
      sendSuccess(res, branch);
    } catch (error) {
      next(error);
    }
  }

  async getByFirmId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { firmId } = req.params as { firmId: string };
      const branches = await branchesService.getByFirmId(firmId);
      sendSuccess(res, branches);
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
      const branch = await branchesService.create(req.body as CreateBranchInput);
      sendSuccess(res, branch, 201);
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
      const branch = await branchesService.update(id, req.body as UpdateBranchInput);
      sendSuccess(res, branch);
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
      await branchesService.delete(id);
      sendSuccess(res, { message: 'Branch deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const branchesController = new BranchesController();
