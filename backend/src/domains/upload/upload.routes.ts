import { Router } from 'express';
import { uploadController } from './upload.controller.js';
import { uploadFirmImage, uploadProductImage } from './multer.config.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// WaterGo admin can upload firm logos when creating new firms
router.post(
  '/admin/firm-logo',
  authenticate,
  requireRoles(UserRole.WATERGO_ADMIN),
  uploadFirmImage.single('image'),
  uploadController.uploadFirmLogo
);

// Protected routes - only FIRM_OWNER can upload images
router.post(
  '/firm-logo',
  authenticate,
  requireRoles(UserRole.FIRM_OWNER),
  uploadFirmImage.single('image'),
  uploadController.uploadFirmLogo
);

router.post(
  '/home-banner',
  authenticate,
  requireRoles(UserRole.FIRM_OWNER),
  uploadFirmImage.single('image'),
  uploadController.uploadHomeBanner
);

router.post(
  '/detail-banner',
  authenticate,
  requireRoles(UserRole.FIRM_OWNER),
  uploadFirmImage.single('image'),
  uploadController.uploadDetailBanner
);

router.post(
  '/product-image',
  authenticate,
  requireRoles(UserRole.FIRM_OWNER),
  uploadProductImage.single('image'),
  uploadController.uploadProductImage
);

// Legacy endpoint for backwards compatibility
router.post(
  '/firm-image',
  authenticate,
  requireRoles(UserRole.FIRM_OWNER),
  uploadFirmImage.single('image'),
  uploadController.uploadFirmLogo
);

export { router as uploadRoutes };
