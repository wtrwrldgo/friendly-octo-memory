/**
 * Sentry Service - Crash Reporting
 * Handles error tracking and performance monitoring
 *
 * Note: Install @sentry/react-native for production builds:
 *   npm install @sentry/react-native
 */

import ENV_CONFIG from '../config/environment';

// Type definitions for Sentry (will be installed separately)
interface SentryInterface {
  init(options: any): void;
  captureException(error: Error, context?: any): void;
  captureMessage(message: string, level?: string): void;
  setUser(user: { id: string; email?: string; username?: string } | null): void;
  setContext(name: string, context: any): void;
  addBreadcrumb(breadcrumb: any): void;
}

class SentryService {
  private sentry: SentryInterface | null = null;
  private isInitialized = false;

  /**
   * Initialize Sentry SDK
   * Call this once at app startup
   */
  async initialize(): Promise<void> {
    // Only initialize if DSN is provided and not in development
    if (!ENV_CONFIG.sentryDSN || ENV_CONFIG.env === 'development') {
      console.log('[Sentry] Skipped initialization (no DSN or development mode)');
      return;
    }

    try {
      // Dynamically import Sentry to avoid requiring it in development
      // Use Function constructor to avoid TypeScript checking the import
      const loadSentry = new Function('return import("@sentry/react-native")');
      const Sentry: any = await loadSentry().catch(() => {
        console.warn('[Sentry] Package not installed. Run: npm install @sentry/react-native');
        return null;
      });

      if (!Sentry) return;

      Sentry.init({
        dsn: ENV_CONFIG.sentryDSN,
        environment: ENV_CONFIG.env,

        // Performance Monitoring
        tracesSampleRate: ENV_CONFIG.env === 'production' ? 0.2 : 1.0,

        // Enable in production and staging only
        enabled: true,

        // Debug in staging
        debug: ENV_CONFIG.env === 'staging',

        // Release tracking
        release: `watergo-driver@1.0.0`,

        // Before send hook - filter sensitive data
        beforeSend(event: any) {
          // Remove sensitive data
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
          }
          return event;
        },
      });

      this.sentry = Sentry;
      this.isInitialized = true;
      console.log('[Sentry] Initialized successfully');
    } catch (error) {
      console.warn('[Sentry] Failed to initialize:', error);
      // Don't crash if Sentry fails to load
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized || !this.sentry) {
      console.error('[Sentry] Error (not sent):', error);
      return;
    }

    try {
      this.sentry.captureException(error, context);
    } catch (e) {
      console.error('[Sentry] Failed to capture exception:', e);
    }
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.isInitialized || !this.sentry) {
      console.log('[Sentry] Message (not sent):', message);
      return;
    }

    try {
      this.sentry.captureMessage(message, level);
    } catch (e) {
      console.error('[Sentry] Failed to capture message:', e);
    }
  }

  /**
   * Set user context
   */
  setUser(userId: string, email?: string, username?: string): void {
    if (!this.isInitialized || !this.sentry) return;

    try {
      this.sentry.setUser({
        id: userId,
        email,
        username,
      });
    } catch (e) {
      console.error('[Sentry] Failed to set user:', e);
    }
  }

  /**
   * Clear user context (on logout)
   */
  clearUser(): void {
    if (!this.isInitialized || !this.sentry) return;

    try {
      this.sentry.setUser(null);
    } catch (e) {
      console.error('[Sentry] Failed to clear user:', e);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (!this.isInitialized || !this.sentry) return;

    try {
      this.sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
        timestamp: Date.now() / 1000,
      });
    } catch (e) {
      console.error('[Sentry] Failed to add breadcrumb:', e);
    }
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: Record<string, any>): void {
    if (!this.isInitialized || !this.sentry) return;

    try {
      this.sentry.setContext(name, context);
    } catch (e) {
      console.error('[Sentry] Failed to set context:', e);
    }
  }
}

export default new SentryService();
