export declare const paymentConfig: {
    payme: {
        merchantId: string;
        secretKey: string;
        testMode: true;
        checkoutUrl: string;
    };
    click: {
        merchantId: string;
        serviceId: string;
        secretKey: string;
        merchantUserId: string;
        checkoutUrl: string;
    };
    plans: {
        BASIC: {
            id: string;
            name: string;
            priceMonthly: number;
            priceYearly: number;
            features: string[];
        };
        PRO: {
            id: string;
            name: string;
            priceMonthly: number;
            priceYearly: number;
            features: string[];
        };
        MAX: {
            id: string;
            name: string;
            priceMonthly: number;
            priceYearly: number;
            features: string[];
        };
    };
    returnUrls: {
        success: string;
        cancel: string;
    };
};
export type PlanId = 'BASIC' | 'PRO' | 'MAX';
export type PaymentProvider = 'payme' | 'click';
export type BillingPeriod = 'monthly' | 'yearly';
//# sourceMappingURL=payment.config.d.ts.map