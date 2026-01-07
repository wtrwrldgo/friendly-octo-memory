interface PushNotificationPayload {
    userId: string;
    title: string;
    body: string;
    sound?: string;
    data?: Record<string, unknown>;
}
declare class PushNotificationService {
    private readonly baseUrl;
    /**
     * Send a push notification to a specific user
     * Sends to all registered devices for that user
     */
    sendToUser(payload: PushNotificationPayload): Promise<void>;
    /**
     * Send notification for an order stage change
     */
    sendOrderStageNotification(userId: string, stage: string, orderId?: string): Promise<void>;
    /**
     * Send notification when a courier is assigned to an order
     */
    sendCourierAssignedNotification(userId: string, orderId: string): Promise<void>;
    /**
     * Send push notifications to Expo's servers
     * Handles batching for large numbers of tokens
     */
    private sendPushNotifications;
    /**
     * Remove an invalid push token from the database
     */
    private removeInvalidToken;
    /**
     * Split array into chunks
     */
    private chunkArray;
}
export declare const pushNotificationService: PushNotificationService;
export {};
//# sourceMappingURL=push-notification.service.d.ts.map