import { prisma } from '../../infrastructure/database/prisma.js';
import { paymentConfig } from '../../config/payment.config.js';
import crypto from 'crypto';
export class PaymentService {
    // Generate unique transaction ID
    generateTransactionId() {
        return `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }
    // Get plan price
    getPlanPrice(planId, billingPeriod) {
        const plan = paymentConfig.plans[planId];
        if (!plan) {
            throw new Error(`Invalid plan: ${planId}`);
        }
        return billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    }
    // Create payment record and generate checkout URL
    async createPayment(params) {
        const { firmId, planId, billingPeriod, provider } = params;
        // Calculate amount
        const amount = this.getPlanPrice(planId, billingPeriod);
        const transactionId = this.generateTransactionId();
        // Create payment record
        const payment = await prisma.payments.create({
            data: {
                firm_id: firmId,
                type: 'SUBSCRIPTION',
                provider,
                transaction_id: transactionId,
                amount: amount * 100, // Convert to tiyin (1 sum = 100 tiyin)
                status: 'PENDING',
                plan_id: planId,
                billing_period: billingPeriod,
                metadata: {
                    planName: paymentConfig.plans[planId].name,
                    firmId,
                },
            },
        });
        // Generate checkout URL based on provider
        const checkoutUrl = this.generateCheckoutUrl(provider, {
            transactionId,
            amount: amount * 100, // Payme expects tiyin
            firmId,
        });
        return {
            paymentId: payment.id,
            checkoutUrl,
            transactionId,
        };
    }
    // Generate checkout URL for Payme or Click
    generateCheckoutUrl(provider, params) {
        const { transactionId, amount } = params;
        if (provider === 'payme') {
            // Payme checkout URL format
            // Base64 encode the merchant data
            const merchantData = {
                m: paymentConfig.payme.merchantId,
                ac: { order_id: transactionId },
                a: amount,
                c: paymentConfig.returnUrls.success,
            };
            const encodedData = Buffer.from(JSON.stringify(merchantData)).toString('base64');
            return `${paymentConfig.payme.checkoutUrl}/${encodedData}`;
        }
        else {
            // Click checkout URL format
            const clickParams = new URLSearchParams({
                service_id: paymentConfig.click.serviceId,
                merchant_id: paymentConfig.click.merchantId,
                amount: String(amount / 100), // Click expects sum, not tiyin
                transaction_param: transactionId,
                return_url: paymentConfig.returnUrls.success,
            });
            return `${paymentConfig.click.checkoutUrl}?${clickParams.toString()}`;
        }
    }
    // Get payment by transaction ID
    async getPaymentByTransactionId(transactionId) {
        return prisma.payments.findUnique({
            where: { transaction_id: transactionId },
        });
    }
    // Get payment by ID
    async getPaymentById(id) {
        return prisma.payments.findUnique({
            where: { id },
        });
    }
    // Update payment status (called by webhook handlers)
    async updatePaymentStatus(transactionId, status, externalId, errorMessage) {
        const payment = await prisma.payments.update({
            where: { transaction_id: transactionId },
            data: {
                status,
                external_id: externalId,
                error_message: errorMessage,
                completed_at: status === 'COMPLETED' ? new Date() : undefined,
            },
        });
        // If payment completed, activate subscription
        if (status === 'COMPLETED' && payment.plan_id) {
            await this.activateSubscription(payment.firm_id, payment.plan_id, payment.billing_period);
        }
        return payment;
    }
    // Activate subscription after successful payment
    async activateSubscription(firmId, planId, billingPeriod) {
        const now = new Date();
        const subscriptionEndAt = new Date(now);
        if (billingPeriod === 'yearly') {
            subscriptionEndAt.setFullYear(subscriptionEndAt.getFullYear() + 1);
        }
        else {
            subscriptionEndAt.setMonth(subscriptionEndAt.getMonth() + 1);
        }
        await prisma.firms.update({
            where: { id: firmId },
            data: {
                subscription_status: planId,
                trial_end_at: subscriptionEndAt, // Reuse trialEndAt as subscription end date
            },
        });
    }
    // Get payment history for a firm
    async getPaymentHistory(firmId) {
        return prisma.payments.findMany({
            where: { firm_id: firmId },
            orderBy: { created_at: 'desc' },
        });
    }
    // Cancel pending payment
    async cancelPayment(transactionId) {
        return prisma.payments.update({
            where: { transaction_id: transactionId },
            data: {
                status: 'CANCELLED',
            },
        });
    }
}
export const paymentService = new PaymentService();
//# sourceMappingURL=payment.service.js.map