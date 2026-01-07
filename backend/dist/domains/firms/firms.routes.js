import { Router } from 'express';
import { firmsController } from './firms.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { UserRole } from '@prisma/client';
import { createFirmSchema, updateFirmSchema, firmIdSchema, listFirmsQuerySchema, } from './firms.schema.js';
const router = Router();
// Public route for client app - only returns firms visible in client app
router.get('/public', firmsController.listPublic.bind(firmsController));
// Admin/CRM routes - returns all firms (used by CRM)
router.get('/', validate({ query: listFirmsQuerySchema }), firmsController.list.bind(firmsController));
router.get('/:id', validate({ params: firmIdSchema }), firmsController.getById.bind(firmsController));
// Protected routes - Admin only
router.post('/', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ body: createFirmSchema }), firmsController.create.bind(firmsController));
router.put('/:id', authenticate, requireRoles(UserRole.WATERGO_ADMIN, UserRole.FIRM_OWNER, UserRole.STAFF), validate({ params: firmIdSchema, body: updateFirmSchema }), firmsController.update.bind(firmsController));
router.delete('/:id', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: firmIdSchema }), firmsController.delete.bind(firmsController));
// Firm owner can submit their own firm for review
router.patch('/:id/submit-for-review', authenticate, requireRoles(UserRole.FIRM_OWNER), validate({ params: firmIdSchema }), firmsController.submitForReview.bind(firmsController));
// WaterGo Admin only - approve a firm
router.patch('/:id/approve', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: firmIdSchema }), firmsController.approve.bind(firmsController));
// WaterGo Admin only - reject a firm
router.patch('/:id/reject', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: firmIdSchema }), firmsController.reject.bind(firmsController));
// WaterGo Admin only - reactivate a suspended firm
router.patch('/:id/reactivate', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: firmIdSchema }), firmsController.reactivate.bind(firmsController));
// WaterGo Admin only - suspend an active firm
router.patch('/:id/suspend', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: firmIdSchema }), firmsController.suspend.bind(firmsController));
export { router as firmRoutes };
//# sourceMappingURL=firms.routes.js.map