import { prisma } from '../infrastructure/database/prisma.js';
// Notification content for each order stage
const ORDER_STAGE_NOTIFICATIONS = {
    CONFIRMED: {
        title: 'Order Confirmed',
        body: 'Your order has been confirmed.',
        sound: 'stage-confirmed.mp3',
    },
    COURIER_ASSIGNED: {
        title: 'Courier Assigned',
        body: 'A courier has been assigned to your order.',
        sound: 'stage-notification.mp3',
    },
    DELIVERING: {
        title: 'Courier On The Way',
        body: 'The courier is on the way.',
        sound: 'stage-onway.mp3',
    },
    ARRIVED: {
        title: 'Courier Arrived',
        body: 'The courier has arrived.',
        sound: 'stage-arrived.mp3',
    },
    DELIVERED: {
        title: 'Order Delivered',
        body: 'Your order has been delivered. Thank you!',
        sound: 'stage-delivered.mp3',
    },
};
class PushNotificationService {
    baseUrl = 'https://exp.host/--/api/v2/push/send';
    /**
     * Send a push notification to a specific user
     * Sends to all registered devices for that user
     */
    async sendToUser(payload) {
        try {
            // Get all push tokens for the user
            const tokens = await prisma.push_tokens.findMany({
                where: { user_id: payload.userId },
            });
            if (tokens.length === 0) {
                console.log(`[Push] No tokens found for user ${payload.userId}`);
                return;
            }
            console.log(`[Push] Sending to ${tokens.length} device(s) for user ${payload.userId}`);
            // Build messages for each device
            const messages = tokens.map((t) => ({
                to: t.token,
                title: payload.title,
                body: payload.body,
                sound: payload.sound || 'default',
                data: payload.data,
                channelId: 'order-updates',
                priority: 'high',
            }));
            // Send notifications
            await this.sendPushNotifications(messages);
        }
        catch (error) {
            console.error('[Push] Error sending to user:', error);
        }
    }
    /**
     * Send notification for an order stage change
     */
    async sendOrderStageNotification(userId, stage, orderId) {
        const notification = ORDER_STAGE_NOTIFICATIONS[stage];
        if (!notification) {
            console.log(`[Push] No notification configured for stage: ${stage}`);
            return;
        }
        await this.sendToUser({
            userId,
            title: notification.title,
            body: notification.body,
            sound: notification.sound,
            data: { stage, orderId },
        });
    }
    /**
     * Send notification when a courier is assigned to an order
     */
    async sendCourierAssignedNotification(userId, orderId) {
        const notification = ORDER_STAGE_NOTIFICATIONS['COURIER_ASSIGNED'];
        if (!notification)
            return;
        await this.sendToUser({
            userId,
            title: notification.title,
            body: notification.body,
            sound: notification.sound,
            data: { stage: 'COURIER_ASSIGNED', orderId },
        });
    }
    /**
     * Send push notifications to Expo's servers
     * Handles batching for large numbers of tokens
     */
    async sendPushNotifications(messages) {
        if (messages.length === 0)
            return;
        // Batch in chunks of 100 (Expo limit)
        const chunks = this.chunkArray(messages, 100);
        for (const chunk of chunks) {
            try {
                const response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Accept-Encoding': 'gzip, deflate',
                    },
                    body: JSON.stringify(chunk),
                });
                if (!response.ok) {
                    console.error(`[Push] HTTP error: ${response.status}`);
                    continue;
                }
                const result = (await response.json());
                // Log results
                result.data.forEach((ticket, index) => {
                    const message = chunk[index];
                    if (!message)
                        return;
                    if (ticket.status === 'ok') {
                        console.log(`[Push] Sent successfully: ${ticket.id}`);
                    }
                    else {
                        console.error(`[Push] Failed to send to ${message.to}: ${ticket.message}`);
                        // Handle invalid tokens by removing them
                        if (ticket.details?.error === 'DeviceNotRegistered') {
                            this.removeInvalidToken(message.to);
                        }
                    }
                });
            }
            catch (error) {
                console.error('[Push] Error sending batch:', error);
            }
        }
    }
    /**
     * Remove an invalid push token from the database
     */
    async removeInvalidToken(token) {
        try {
            await prisma.push_tokens.deleteMany({
                where: { token },
            });
            console.log(`[Push] Removed invalid token: ${token.substring(0, 20)}...`);
        }
        catch (error) {
            console.error('[Push] Error removing invalid token:', error);
        }
    }
    /**
     * Split array into chunks
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
// Export singleton instance
export const pushNotificationService = new PushNotificationService();
//# sourceMappingURL=push-notification.service.js.map