import { Router } from 'express';
import { driversController } from './drivers.controller.js';
import { authenticate, optionalAuth } from '../../middleware/index.js';
const router = Router();
// Read routes - optional auth (allow public access for now)
router.get('/', optionalAuth, driversController.list);
router.get('/:id', optionalAuth, driversController.getById);
// Write routes - require JWT authentication
router.post('/', authenticate, driversController.create);
router.put('/:id', authenticate, driversController.update);
router.delete('/:id', authenticate, driversController.delete);
// Driver app specific routes
router.put('/:id/status', authenticate, driversController.updateStatus);
router.put('/:id/location', authenticate, driversController.updateLocation);
router.get('/:id/orders', optionalAuth, driversController.getOrders);
export { router as driverRoutes };
//# sourceMappingURL=drivers.routes.js.map