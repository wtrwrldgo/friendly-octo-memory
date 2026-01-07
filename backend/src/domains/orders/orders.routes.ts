import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { optionalAuth } from '../../middleware/index.js';

const router = Router();

// Create order
router.post('/', optionalAuth, ordersController.create);

// Get orders by user ID
router.get('/user/:userId', optionalAuth, ordersController.getByUserId);

// List all orders (for CRM/admin)
router.get('/', optionalAuth, ordersController.list);

// Get order status (for tracking)
router.get('/:id/status', optionalAuth, ordersController.getStatus);

// Cancel order
router.post('/:id/cancel', optionalAuth, ordersController.cancelOrder);

// Accept order (driver accepts the order)
router.post('/:id/accept', optionalAuth, ordersController.acceptOrder);

// Get order by ID
router.get('/:id', optionalAuth, ordersController.getById);

// Update order status
router.put('/:id/status', optionalAuth, ordersController.updateStatus);

export { router as orderRoutes };
