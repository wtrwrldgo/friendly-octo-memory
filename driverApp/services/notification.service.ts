/**
 * Notification Service - Driver App
 * Handles push notifications, permissions, and token management
 * Note: Push token registration via backend not yet implemented
 */

import * as Notifications from 'expo-notifications';
import ENV_CONFIG from '../config/environment';

// Flag to track if notifications are available
let notificationsAvailable = true;

// Configure notification handler (wrapped in try-catch for Expo Go compatibility)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log('[Notifications] Native module not available (running in Expo Go?)');
  notificationsAvailable = false;
}

class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!notificationsAvailable) {
      console.log('[Notifications] Skipping permissions - native module not available');
      return false;
    }

    try {
      const { status: existingStatus} = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get Expo push token
   */
  async getExpoPushToken(): Promise<string | null> {
    if (!notificationsAvailable) {
      console.log('[Notifications] Skipping push token - native module not available');
      return null;
    }

    try {
      // Skip push token in local dev mode (no valid projectId)
      if (ENV_CONFIG.useLocalBackend) {
        console.log('[Notifications] Skipping push token - using local backend');
        return null;
      }

      // For physical devices, ensure permissions are granted
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get push token - requires valid Expo projectId
      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      if (!projectId) {
        console.warn('[Notifications] No EXPO_PUBLIC_PROJECT_ID set - skipping push token');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return tokenData.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Register push token with backend
   * TODO: Implement via Express backend when push notifications are needed
   */
  async registerPushToken(driverId: string, pushToken: string): Promise<void> {
    console.log(`[Notifications] Push token registration skipped (not implemented)`);
    console.log(`[Notifications] Driver: ${driverId}, Token: ${pushToken.substring(0, 20)}...`);
    // TODO: Call Express backend to register push token
    // await fetch(`${API_URL}/drivers/${driverId}/push-token`, { method: 'POST', body: JSON.stringify({ pushToken }) });
  }

  /**
   * Remove push token from backend (on logout)
   * TODO: Implement via Express backend when push notifications are needed
   */
  async removePushToken(driverId: string): Promise<void> {
    console.log(`[Notifications] Push token removal skipped (not implemented)`);
    console.log(`[Notifications] Driver: ${driverId}`);
    // TODO: Call Express backend to remove push token
    // await fetch(`${API_URL}/drivers/${driverId}/push-token`, { method: 'DELETE' });
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription | undefined {
    if (!notificationsAvailable) {
      return undefined;
    }
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription | undefined {
    if (!notificationsAvailable) {
      return undefined;
    }
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Show a local notification immediately
   */
  async showLocalNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    if (!notificationsAvailable) {
      console.log('[Notifications] Skipping local notification - native module not available');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('[Notifications] Error showing local notification:', error);
      // Don't throw - notifications are not critical
    }
  }

  /**
   * Schedule a local notification for later
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    triggerSeconds: number = 0
  ): Promise<string> {
    if (!notificationsAvailable) {
      console.log('[Notifications] Skipping scheduled notification - native module not available');
      return '';
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: triggerSeconds > 0 ? { seconds: triggerSeconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL } as any : null,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    if (!notificationsAvailable) {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(): Promise<number> {
    if (!notificationsAvailable) {
      return 0;
    }

    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    if (!notificationsAvailable) {
      return;
    }

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
}

export default new NotificationService();
