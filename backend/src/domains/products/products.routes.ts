import { Router } from 'express';
import { productsController } from './products.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes - anyone can view products
router.get('/', productsController.list);
router.get('/:id', productsController.getById);

// Protected routes - Firm owners can manage their products
router.post(
  '/',
  authenticate,
  requireRoles(UserRole.FIRM_OWNER),
  productsController.create
);

router.put(
  '/:id',
  authenticate,
  requireRoles(UserRole.FIRM_OWNER),
  productsController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRoles(UserRole.FIRM_OWNER),
  productsController.delete
);

export { router as productRoutes };
