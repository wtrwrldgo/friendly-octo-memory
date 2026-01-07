import { Router } from 'express';
import { clientsController } from './clients.controller.js';
import { authenticate } from '../../middleware/index.js';
const router = Router();
// Protected routes - require JWT authentication (admin access)
router.get('/', authenticate, clientsController.list);
router.get('/:id', authenticate, clientsController.getById);
router.delete('/:id', authenticate, clientsController.delete);
export { router as clientRoutes };
//# sourceMappingURL=clients.routes.js.map