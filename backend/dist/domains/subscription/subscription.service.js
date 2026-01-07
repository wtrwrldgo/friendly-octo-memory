import { prisma } from '../../infrastructure/database/prisma.js';
export class SubscriptionService {
    async getSubscriptionStatus(firmId) {
        const firm = await prisma.firms.findUnique({
            where: { id: firmId },
            select: {
                subscription_status: true,
                trial_start_at: true,
                trial_end_at: true,
            },
        });
        if (!firm) {
            throw new Error('Firm not found');
        }
        const now = new Date();
        let daysRemaining = null;
        let isTrialExpired = false;
        if (firm.trial_end_at) {
            const diffTime = firm.trial_end_at.getTime() - now.getTime();
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            isTrialExpired = daysRemaining <= 0;
        }
        // Determine if firm has access
        const hasAccess = this.checkAccess(firm.subscription_status, isTrialExpired);
        return {
            status: firm.subscription_status,
            trialStartAt: firm.trial_start_at,
            trialEndAt: firm.trial_end_at,
            daysRemaining: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
            isTrialExpired,
            hasAccess,
        };
    }
    async checkAndUpdateTrialStatus(firmId) {
        const info = await this.getSubscriptionStatus(firmId);
        // If trial is expired but status is still TRIAL_ACTIVE, update it
        if (info.isTrialExpired && info.status === 'TRIAL_ACTIVE') {
            await prisma.firms.update({
                where: { id: firmId },
                data: { subscription_status: 'TRIAL_EXPIRED' },
            });
            return {
                ...info,
                status: 'TRIAL_EXPIRED',
                hasAccess: false,
            };
        }
        return info;
    }
    checkAccess(status, isTrialExpired) {
        // Paid plans always have access
        if (['BASIC', 'PRO', 'MAX'].includes(status)) {
            return true;
        }
        // Trial active and not expired
        if (status === 'TRIAL_ACTIVE' && !isTrialExpired) {
            return true;
        }
        // Trial expired or status is TRIAL_EXPIRED
        return false;
    }
    // Get all firms with their subscription info (WaterGo admin only)
    async getAllFirmsSubscriptions() {
        const WATERGO_FIRM_ID = '00000000-0000-0000-0000-000000000000';
        const firms = await prisma.firms.findMany({
            where: {
                id: { not: WATERGO_FIRM_ID }, // Exclude WaterGo firm
            },
            select: {
                id: true,
                name: true,
                status: true,
                subscription_status: true,
                trial_start_at: true,
                trial_end_at: true,
                logo_url: true,
            },
            orderBy: { created_at: 'desc' },
        });
        const now = new Date();
        return firms.map((firm) => {
            let daysRemaining = null;
            let isExpired = false;
            if (firm.trial_end_at) {
                const diffTime = firm.trial_end_at.getTime() - now.getTime();
                daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                isExpired = daysRemaining <= 0;
            }
            return {
                id: firm.id,
                name: firm.name,
                status: firm.status,
                subscriptionStatus: firm.subscription_status,
                trialStartAt: firm.trial_start_at?.toISOString() || null,
                trialEndAt: firm.trial_end_at?.toISOString() || null,
                daysRemaining: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
                isExpired,
                logoUrl: firm.logo_url,
            };
        });
    }
}
export const subscriptionService = new SubscriptionService();
//# sourceMappingURL=subscription.service.js.map