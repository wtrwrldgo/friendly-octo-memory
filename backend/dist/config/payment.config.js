// file: config/payment.config.ts
// Payment configuration for Payme and Click
export const paymentConfig = {
    payme: {
        merchantId: process.env.PAYME_MERCHANT_ID || 'test_merchant_id',
        secretKey: process.env.PAYME_SECRET_KEY || 'test_secret_key',
        testMode: process.env.PAYME_TEST_MODE === 'true' || true,
        checkoutUrl: process.env.PAYME_TEST_MODE === 'true'
            ? 'https://checkout.test.paycom.uz'
            : 'https://checkout.paycom.uz',
    },
    click: {
        merchantId: process.env.CLICK_MERCHANT_ID || 'test_merchant_id',
        serviceId: process.env.CLICK_SERVICE_ID || 'test_service_id',
        secretKey: process.env.CLICK_SECRET_KEY || 'test_secret_key',
        merchantUserId: process.env.CLICK_MERCHANT_USER_ID || 'test_user_id',
        checkoutUrl: 'https://my.click.uz/services/pay',
    },
    // Subscription plans (prices in UZS)
    plans: {
        BASIC: {
            id: 'BASIC',
            name: 'Basic',
            priceMonthly: 99000, // 99,000 UZS
            priceYearly: 990000, // 990,000 UZS (2 months free)
            features: [
                'Up to 100 orders/month',
                'Up to 5 drivers',
                'Basic analytics',
                'Email support',
            ],
        },
        PRO: {
            id: 'PRO',
            name: 'Pro',
            priceMonthly: 199000, // 199,000 UZS
            priceYearly: 1990000, // 1,990,000 UZS (2 months free)
            features: [
                'Up to 500 orders/month',
                'Up to 15 drivers',
                'Advanced analytics',
                'Priority support',
                'Custom branding',
            ],
        },
        MAX: {
            id: 'MAX',
            name: 'Max',
            priceMonthly: 399000, // 399,000 UZS
            priceYearly: 3990000, // 3,990,000 UZS (2 months free)
            features: [
                'Unlimited orders',
                'Unlimited drivers',
                'Full analytics suite',
                '24/7 phone support',
                'Custom integrations',
                'Dedicated manager',
            ],
        },
    },
    returnUrls: {
        success: process.env.CRM_URL || 'http://localhost:3000' + '/payment/success',
        cancel: process.env.CRM_URL || 'http://localhost:3000' + '/payment/cancel',
    },
};
//# sourceMappingURL=payment.config.js.map