import { type PlanId, type BillingPeriod, type PaymentProvider } from '../../config/payment.config.js';
export interface CreatePaymentParams {
    firmId: string;
    planId: PlanId;
    billingPeriod: BillingPeriod;
    provider: PaymentProvider;
}
export interface PaymentCheckoutResult {
    paymentId: string;
    checkoutUrl: string;
    transactionId: string;
}
export declare class PaymentService {
    private generateTransactionId;
    private getPlanPrice;
    createPayment(params: CreatePaymentParams): Promise<PaymentCheckoutResult>;
    private generateCheckoutUrl;
    getPaymentByTransactionId(transactionId: string): Promise<{
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        firm_id: string;
        provider: string;
        transaction_id: string | null;
        external_id: string | null;
        amount: number;
        plan_id: string | null;
        billing_period: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        error_message: string | null;
        completed_at: Date | null;
    } | null>;
    getPaymentById(id: string): Promise<{
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        firm_id: string;
        provider: string;
        transaction_id: string | null;
        external_id: string | null;
        amount: number;
        plan_id: string | null;
        billing_period: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        error_message: string | null;
        completed_at: Date | null;
    } | null>;
    updatePaymentStatus(transactionId: string, status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED', externalId?: string, errorMessage?: string): Promise<{
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        firm_id: string;
        provider: string;
        transaction_id: string | null;
        external_id: string | null;
        amount: number;
        plan_id: string | null;
        billing_period: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        error_message: string | null;
        completed_at: Date | null;
    }>;
    private activateSubscription;
    getPaymentHistory(firmId: string): Promise<{
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        firm_id: string;
        provider: string;
        transaction_id: string | null;
        external_id: string | null;
        amount: number;
        plan_id: string | null;
        billing_period: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        error_message: string | null;
        completed_at: Date | null;
    }[]>;
    cancelPayment(transactionId: string): Promise<{
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        firm_id: string;
        provider: string;
        transaction_id: string | null;
        external_id: string | null;
        amount: number;
        plan_id: string | null;
        billing_period: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        error_message: string | null;
        completed_at: Date | null;
    }>;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=payment.service.d.ts.map