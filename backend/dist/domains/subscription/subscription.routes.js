import { Router } from 'express';
import { subscriptionService } from './subscription.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../shared/utils/response.js';
const router = Router();
// Get subscription status for the authenticated staff's firm
router.get('/status', authenticate, async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.firmId) {
            res.status(400).json({
                success: false,
                message: 'No firm associated with this user'
            });
            return;
        }
        const status = await subscriptionService.checkAndUpdateTrialStatus(user.firmId);
        sendSuccess(res, status);
    }
    catch (error) {
        next(error);
    }
});
// Get subscription status for a specific firm (admin only)
router.get('/status/:firmId', authenticate, async (req, res, next) => {
    try {
        const user = req.user;
        const firmId = req.params.firmId;
        if (!firmId) {
            res.status(400).json({
                success: false,
                message: 'Firm ID is required'
            });
            return;
        }
        // Only WaterGo admin can check other firms' subscription
        if (user.role !== 'WATERGO_ADMIN' && user.firmId !== firmId) {
            res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
            return;
        }
        const status = await subscriptionService.checkAndUpdateTrialStatus(firmId);
        sendSuccess(res, status);
    }
    catch (error) {
        next(error);
    }
});
// Get all firms subscription statuses (WaterGo admin only)
router.get('/all', authenticate, async (req, res, next) => {
    try {
        const user = req.user;
        // Only WaterGo admin can view all firms' subscriptions
        if (user.role !== 'WATERGO_ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Forbidden - WaterGo admin access required'
            });
            return;
        }
        const subscriptions = await subscriptionService.getAllFirmsSubscriptions();
        sendSuccess(res, subscriptions);
    }
    catch (error) {
        next(error);
    }
});
export { router as subscriptionRoutes };
//# sourceMappingURL=subscription.routes.js.map