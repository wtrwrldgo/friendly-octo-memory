import type { Request, Response, NextFunction } from 'express';
import { clientsService } from './clients.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

interface ClientsListQuery {
  firmId?: string;
  branchId?: string;
  includeGlobal?: string; // Query params come as strings
}

export const clientsController = {
  /**
   * List clients with firm isolation.
   *
   * Query params:
   * - firmId: Required for firm staff. Only returns clients who ordered from this firm.
   * - branchId: Optional. Further filter by branch.
   * - includeGlobal: Only for WaterGo Super Admin. Set to "true" to get all clients.
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firmId, branchId, includeGlobal } = req.query as ClientsListQuery;

      console.log('[Clients] List request:', { firmId, branchId, includeGlobal, query: req.query });

      const clients = await clientsService.list({
        firmId,
        branchId,
        includeGlobal: includeGlobal === 'true',
      });

      console.log('[Clients] Returning', clients.length, 'clients for firmId:', firmId);

      sendSuccess(res, clients);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single client by ID with firm isolation.
   *
   * Query params:
   * - firmId: If provided, only return client if they have ordered from this firm,
   *           and only show orders from this firm.
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { firmId } = req.query as { firmId?: string };

      const client = await clientsService.getById(id, firmId);
      if (!client) {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await clientsService.delete(id);
      if (!result) {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      sendSuccess(res, { message: 'Client deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
