import { Router } from 'express';
import { staffController } from './staff.controller.js';
import { authenticate } from '../../middleware/index.js';

const router = Router();

// All staff routes require authentication
router.get('/', authenticate, staffController.list);
router.get('/:id', authenticate, staffController.getById);
router.post('/', authenticate, staffController.create);
router.put('/:id', authenticate, staffController.update);
router.delete('/:id', authenticate, staffController.delete);

export { router as staffRoutes };
