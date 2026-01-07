import type { Request, Response, NextFunction } from 'express';
import { driversService } from './drivers.service.js';
import { ordersService } from '../orders/orders.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export const driversController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firmId, branchId } = req.query as { firmId?: string; branchId?: string };
      const drivers = await driversService.list(firmId, branchId);
      sendSuccess(res, drivers);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const driver = await driversService.getById(id);
      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }
      sendSuccess(res, driver);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Map city to district for database storage
      const data = {
        ...req.body,
        district: req.body.city || req.body.district,
      };
      const driver = await driversService.create(data);
      sendSuccess(res, driver, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const driver = await driversService.update(id, req.body);
      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }
      sendSuccess(res, driver);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await driversService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }
      sendSuccess(res, { message: 'Driver deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Update driver online status
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { isOnline } = req.body;
      const driver = await driversService.update(id, { isAvailable: isOnline });
      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }
      sendSuccess(res, driver);
    } catch (error) {
      next(error);
    }
  },

  // Update driver location
  async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { lat, lng } = req.body;
      await driversService.updateLocation(id, lat, lng);
      sendSuccess(res, { message: 'Location updated' });
    } catch (error) {
      next(error);
    }
  },

  // Get available orders for a driver
  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string;
      // Get available orders (PENDING status, no driver assigned)
      const orders = await ordersService.getAvailableOrders(status);
      sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  },
};
