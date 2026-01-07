import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { staffLoginSchema } from './auth.schema.js';
import { authMobileRoutes } from './auth-mobile.routes.js';

const router = Router();

// Staff login
router.post(
  '/staff/login',
  validate({ body: staffLoginSchema }),
  authController.staffLogin.bind(authController)
);

// Driver login
router.post('/driver/login', authController.driverLogin.bind(authController));

// Admin login
router.post('/admin/login', authController.adminLogin.bind(authController));

// Mobile auth routes
router.use('/mobile', authMobileRoutes);

export { router as authRoutes };
