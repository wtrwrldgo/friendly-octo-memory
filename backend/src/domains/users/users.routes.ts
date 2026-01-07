import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/index.js';

const router = Router();

// Protected routes - require JWT authentication
router.get('/profile/:id', authenticate, usersController.getById);
router.put('/profile/:id', authenticate, usersController.update);

export { router as userRoutes };
