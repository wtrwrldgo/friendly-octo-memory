import type { Request, Response, NextFunction } from 'express';
import { productsService } from './products.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

// Helper to extract language from Accept-Language header
function getLanguageFromHeader(req: Request): string {
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  if (!acceptLanguage) return 'uz';
  // Extract first language code (e.g., "en-US,en;q=0.9" -> "en")
  const firstLang = acceptLanguage.split(',')[0] || 'uz';
  const lang = (firstLang.split('-')[0] || 'uz').toLowerCase();
  // Only allow supported languages
  const supportedLanguages = ['en', 'ru', 'uz', 'kaa'];
  return supportedLanguages.includes(lang) ? lang : 'uz';
}

export const productsController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firmId } = req.query as { firmId?: string };
      const language = getLanguageFromHeader(req);
      const products = await productsService.list(firmId, language);
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const language = getLanguageFromHeader(req);
      const product = await productsService.getById(id, language);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user; // Added by auth middleware
      // Automatically use the authenticated firm owner's firmId
      const productData = { ...req.body, firmId: user.firmId };
      const product = await productsService.create(productData);
      sendSuccess(res, product, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = (req as any).user;
      const product = await productsService.update(id, req.body, user.firmId);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = (req as any).user;
      await productsService.delete(id, user.firmId);
      sendSuccess(res, { message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
