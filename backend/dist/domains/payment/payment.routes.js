import { Router } from 'express';
import { paymentService } from './payment.service.js';
import { paymentConfig } from '../../config/payment.config.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../shared/utils/response.js';
const router = Router();
// Get available plans
router.get('/plans', (_req, res) => {
    const plans = Object.values(paymentConfig.plans).map((plan) => ({
        id: plan.id,
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        features: plan.features,
    }));
    sendSuccess(res, plans);
});
// Create payment and get checkout URL
router.post('/create', authenticate, async (req, res, next) => {
    try {
        const user = req.user;
        const { planId, billingPeriod, provider } = req.body;
        if (!user.firmId) {
            res.status(400).json({
                success: false,
                message: 'No firm associated with this user',
            });
            return;
        }
        // Validate inputs
        if (!['BASIC', 'PRO', 'MAX'].includes(planId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid plan ID. Must be BASIC, PRO, or MAX',
            });
            return;
        }
        if (!['monthly', 'yearly'].includes(billingPeriod)) {
            res.status(400).json({
                success: false,
                message: 'Invalid billing period. Must be monthly or yearly',
            });
            return;
        }
        if (!['payme', 'click'].includes(provider)) {
            res.status(400).json({
                success: false,
                message: 'Invalid payment provider. Must be payme or click',
            });
            return;
        }
        const result = await paymentService.createPayment({
            firmId: user.firmId,
            planId,
            billingPeriod,
            provider,
        });
        sendSuccess(res, result);
    }
    catch (error) {
        next(error);
    }
});
// Get payment status
router.get('/status/:transactionId', authenticate, async (req, res, next) => {
    try {
        const transactionId = req.params.transactionId;
        const payment = await paymentService.getPaymentByTransactionId(transactionId);
        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
            return;
        }
        sendSuccess(res, {
            id: payment.id,
            transactionId: payment.transaction_id,
            status: payment.status,
            amount: payment.amount,
            planId: payment.plan_id,
            billingPeriod: payment.billing_period,
            provider: payment.provider,
            createdAt: payment.created_at,
            completedAt: payment.completed_at,
        });
    }
    catch (error) {
        next(error);
    }
});
// Get payment history for current firm
router.get('/history', authenticate, async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.firmId) {
            res.status(400).json({
                success: false,
                message: 'No firm associated with this user',
            });
            return;
        }
        const payments = await paymentService.getPaymentHistory(user.firmId);
        sendSuccess(res, payments);
    }
    catch (error) {
        next(error);
    }
});
// Cancel pending payment
router.post('/cancel/:transactionId', authenticate, async (req, res, next) => {
    try {
        const transactionId = req.params.transactionId;
        const payment = await paymentService.getPaymentByTransactionId(transactionId);
        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
            return;
        }
        if (payment.status !== 'PENDING') {
            res.status(400).json({
                success: false,
                message: 'Only pending payments can be cancelled',
            });
            return;
        }
        const cancelled = await paymentService.cancelPayment(transactionId);
        sendSuccess(res, { status: cancelled.status });
    }
    catch (error) {
        next(error);
    }
});
// Payme webhook handler
router.post('/webhook/payme', async (req, res, next) => {
    try {
        const { method, params, id } = req.body;
        // Verify authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.json({
                error: { code: -32504, message: 'Unauthorized' },
                id,
            });
            return;
        }
        // Handle different Payme methods
        switch (method) {
            case 'CheckPerformTransaction': {
                const transactionId = params?.account?.order_id;
                const payment = await paymentService.getPaymentByTransactionId(transactionId);
                if (!payment) {
                    res.json({
                        error: { code: -31050, message: 'Order not found' },
                        id,
                    });
                    return;
                }
                if (payment.status !== 'PENDING') {
                    res.json({
                        error: { code: -31051, message: 'Order already processed' },
                        id,
                    });
                    return;
                }
                res.json({
                    result: { allow: true },
                    id,
                });
                break;
            }
            case 'CreateTransaction': {
                const transactionId = params?.account?.order_id;
                const paymeId = params?.id;
                await paymentService.updatePaymentStatus(transactionId, 'PROCESSING', paymeId);
                res.json({
                    result: {
                        create_time: Date.now(),
                        transaction: transactionId,
                        state: 1,
                    },
                    id,
                });
                break;
            }
            case 'PerformTransaction': {
                const transactionId = params?.account?.order_id || params?.id;
                const payment = await paymentService.getPaymentByTransactionId(transactionId);
                if (payment) {
                    await paymentService.updatePaymentStatus(transactionId, 'COMPLETED');
                }
                res.json({
                    result: {
                        perform_time: Date.now(),
                        transaction: transactionId,
                        state: 2,
                    },
                    id,
                });
                break;
            }
            case 'CancelTransaction': {
                const transactionId = params?.account?.order_id || params?.id;
                await paymentService.updatePaymentStatus(transactionId, 'CANCELLED');
                res.json({
                    result: {
                        cancel_time: Date.now(),
                        transaction: transactionId,
                        state: -1,
                    },
                    id,
                });
                break;
            }
            default:
                res.json({
                    error: { code: -32601, message: 'Method not found' },
                    id,
                });
        }
    }
    catch (error) {
        next(error);
    }
});
// Click webhook handlers
router.post('/webhook/click/prepare', async (req, res, next) => {
    try {
        const { merchant_trans_id, amount, click_trans_id } = req.body;
        const payment = await paymentService.getPaymentByTransactionId(merchant_trans_id);
        if (!payment) {
            res.json({
                error: -5,
                error_note: 'Order not found',
            });
            return;
        }
        // Verify amount (Click sends in sum, we store in tiyin)
        if (payment.amount !== amount * 100) {
            res.json({
                error: -2,
                error_note: 'Invalid amount',
            });
            return;
        }
        await paymentService.updatePaymentStatus(merchant_trans_id, 'PROCESSING', click_trans_id);
        res.json({
            error: 0,
            error_note: 'Success',
            click_trans_id,
            merchant_trans_id,
            merchant_prepare_id: payment.id,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/webhook/click/complete', async (req, res, next) => {
    try {
        const { merchant_trans_id, click_trans_id, error } = req.body;
        if (error === 0) {
            await paymentService.updatePaymentStatus(merchant_trans_id, 'COMPLETED', click_trans_id);
        }
        else {
            await paymentService.updatePaymentStatus(merchant_trans_id, 'FAILED', click_trans_id, `Click error: ${error}`);
        }
        res.json({
            error: 0,
            error_note: 'Success',
            click_trans_id,
            merchant_trans_id,
        });
    }
    catch (error) {
        next(error);
    }
});
// Simulate successful payment (for testing only)
router.post('/test/complete/:transactionId', authenticate, async (req, res, next) => {
    try {
        const transactionId = req.params.transactionId;
        // Only allow in development mode
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({
                success: false,
                message: 'Test endpoint not available in production',
            });
            return;
        }
        const payment = await paymentService.getPaymentByTransactionId(transactionId);
        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
            return;
        }
        await paymentService.updatePaymentStatus(transactionId, 'COMPLETED', `TEST-${Date.now()}`);
        sendSuccess(res, { message: 'Payment completed successfully' });
    }
    catch (error) {
        next(error);
    }
});
export { router as paymentRoutes };
//# sourceMappingURL=payment.routes.js.map