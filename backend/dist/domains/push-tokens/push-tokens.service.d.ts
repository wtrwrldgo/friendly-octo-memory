export declare const pushTokensService: {
    /**
     * Register or update a push token for a user
     * Uses upsert to handle token re-registration
     */
    register(userId: string, token: string, platform: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        token: string;
        user_id: string;
        platform: string;
    }>;
    /**
     * Unregister a push token (user logged out or disabled notifications)
     */
    unregister(token: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Get all push tokens for a user
     */
    getByUserId(userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        token: string;
        user_id: string;
        platform: string;
    }[]>;
};
//# sourceMappingURL=push-tokens.service.d.ts.map