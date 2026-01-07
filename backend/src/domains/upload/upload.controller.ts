import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils/response.js';

export const uploadController = {
  async uploadFirmLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const imageUrl = `/static/uploads/firms/${req.file.filename}`;
      sendSuccess(res, { logoUrl: imageUrl, imageUrl });
    } catch (error) {
      next(error);
    }
  },

  async uploadHomeBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const imageUrl = `/static/uploads/firms/${req.file.filename}`;
      sendSuccess(res, { homeBannerUrl: imageUrl, imageUrl });
    } catch (error) {
      next(error);
    }
  },

  async uploadDetailBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const imageUrl = `/static/uploads/firms/${req.file.filename}`;
      sendSuccess(res, { detailBannerUrl: imageUrl, imageUrl });
    } catch (error) {
      next(error);
    }
  },

  async uploadProductImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const imageUrl = `/static/uploads/products/${req.file.filename}`;
      sendSuccess(res, { imageUrl });
    } catch (error) {
      next(error);
    }
  },
};
