import { Router } from 'express';
import { branchesController } from './branches.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { UserRole } from '@prisma/client';
import { createBranchSchema, updateBranchSchema, branchIdSchema, listBranchesQuerySchema, } from './branches.schema.js';
import { z } from 'zod';
const router = Router();
// Public routes
router.get('/', validate({ query: listBranchesQuerySchema }), branchesController.list.bind(branchesController));
router.get('/:id', validate({ params: branchIdSchema }), branchesController.getById.bind(branchesController));
router.get('/firm/:firmId', validate({ params: z.object({ firmId: z.string().uuid() }) }), branchesController.getByFirmId.bind(branchesController));
// Protected routes - Admin and Firm Owner only
router.post('/', authenticate, requireRoles(UserRole.WATERGO_ADMIN, UserRole.FIRM_OWNER), validate({ body: createBranchSchema }), branchesController.create.bind(branchesController));
router.put('/:id', authenticate, requireRoles(UserRole.WATERGO_ADMIN, UserRole.FIRM_OWNER), validate({ params: branchIdSchema, body: updateBranchSchema }), branchesController.update.bind(branchesController));
router.delete('/:id', authenticate, requireRoles(UserRole.WATERGO_ADMIN, UserRole.FIRM_OWNER), validate({ params: branchIdSchema }), branchesController.delete.bind(branchesController));
export { router as branchRoutes };
//# sourceMappingURL=branches.routes.js.map