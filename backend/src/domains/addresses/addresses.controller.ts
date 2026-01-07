import type { Request, Response, NextFunction } from 'express';
import { addressesService } from './addresses.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export const addressesController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const addresses = await addressesService.list(userId);
      sendSuccess(res, addresses);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { title, address, latitude, longitude, isDefault } = req.body;
      if (!title || !address || latitude === undefined || longitude === undefined) {
        res.status(400).json({ success: false, message: 'title, address, latitude, and longitude are required' });
        return;
      }
      const newAddress = await addressesService.create(userId, {
        title,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        isDefault,
      });
      sendSuccess(res, newAddress, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const id = req.params.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      if (!id) {
        res.status(400).json({ success: false, message: 'Address ID is required' });
        return;
      }
      const { title, address, latitude, longitude, isDefault } = req.body;
      const updated = await addressesService.update(id, userId, {
        title,
        address,
        latitude: latitude !== undefined ? Number(latitude) : undefined,
        longitude: longitude !== undefined ? Number(longitude) : undefined,
        isDefault,
      });
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const id = req.params.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      if (!id) {
        res.status(400).json({ success: false, message: 'Address ID is required' });
        return;
      }
      await addressesService.delete(id, userId);
      sendSuccess(res, { message: 'Address deleted' });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const id = req.params.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      if (!id) {
        res.status(400).json({ success: false, message: 'Address ID is required' });
        return;
      }
      const address = await addressesService.getById(id, userId);
      if (!address) {
        res.status(404).json({ success: false, message: 'Address not found' });
        return;
      }
      sendSuccess(res, address);
    } catch (error) {
      next(error);
    }
  },
};
