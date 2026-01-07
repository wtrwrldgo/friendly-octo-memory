import { Router } from 'express';
import { pushTokensController } from './push-tokens.controller.js';
import { authenticate } from '../../middleware/index.js';
const router = Router();
// Register push token (requires authentication)
router.post('/', authenticate, pushTokensController.register);
// Unregister push token (requires authentication)
router.delete('/', authenticate, pushTokensController.unregister);
export { router as pushTokenRoutes };
//# sourceMappingURL=push-tokens.routes.js.map