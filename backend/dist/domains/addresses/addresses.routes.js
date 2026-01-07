import { Router } from 'express';
import { addressesController } from './addresses.controller.js';
import { authenticate } from '../../middleware/index.js';
const router = Router();
// All routes require authentication (mobile app JWT)
router.get('/', authenticate, addressesController.list);
router.post('/', authenticate, addressesController.create);
router.get('/:id', authenticate, addressesController.getById);
router.put('/:id', authenticate, addressesController.update);
router.delete('/:id', authenticate, addressesController.delete);
export { router as addressRoutes };
//# sourceMappingURL=addresses.routes.js.map