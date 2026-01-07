import type { SubscriptionStatus } from '@prisma/client';
export interface SubscriptionInfo {
    status: SubscriptionStatus;
    trialStartAt: Date | null;
    trialEndAt: Date | null;
    daysRemaining: number | null;
    isTrialExpired: boolean;
    hasAccess: boolean;
}
export declare class SubscriptionService {
    getSubscriptionStatus(firmId: string): Promise<SubscriptionInfo>;
    checkAndUpdateTrialStatus(firmId: string): Promise<SubscriptionInfo>;
    private checkAccess;
    getAllFirmsSubscriptions(): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.FirmStatus;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        trialStartAt: string | null;
        trialEndAt: string | null;
        daysRemaining: number | null;
        isExpired: boolean;
        logoUrl: string | null;
    }[]>;
}
export declare const subscriptionService: SubscriptionService;
//# sourceMappingURL=subscription.service.d.ts.map