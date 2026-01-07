import { env } from '../config/env.js';

// ============================================================================
// Eskiz.uz API Response Interfaces
// Based on: https://documenter.getpostman.com/view/663428/RzfmES4z
// ============================================================================

interface EskizTokenResponse {
  message: string;
  data: {
    token: string;
  };
  token_type: string;
}

interface EskizRefreshTokenResponse {
  message: string;
  data: {
    token: string;
  };
  token_type: string;
}

interface EskizSmsResponse {
  id: string;
  status: string;
  message: string;
}

interface EskizBatchSmsMessage {
  user_sms_id: string;
  to: string;
  text: string;
}

interface EskizBatchSmsResponse {
  id: string;
  status: string;
  message: string;
}

interface EskizUserLimitResponse {
  message: string;
  data: {
    limit: number;
    used: number;
    remaining: number;
  };
}

interface EskizUserInfoResponse {
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    balance: number;
    is_verified: boolean;
  };
}

interface EskizMessageStatusResponse {
  message: string;
  data: {
    id: string;
    status: string;
    user_sms_id: string;
    to: string;
    message: string;
    created_at: string;
    updated_at: string;
  };
}

interface EskizDispatchStatusResponse {
  message: string;
  data: {
    dispatch_id: string;
    status: string;
    total_count: number;
    sent_count: number;
    delivered_count: number;
    failed_count: number;
  };
}

interface EskizTemplateResponse {
  message: string;
  data: Array<{
    id: number;
    name: string;
    text: string;
    status: string;
    created_at: string;
  }>;
}

interface EskizNickname {
  id: number;
  name: string;
  status: string;
  is_default: boolean;
}

interface EskizNicknamesResponse {
  message: string;
  data: EskizNickname[];
}

// ============================================================================
// SMS Service Class
// ============================================================================

class SmsService {
  private baseUrl = 'https://notify.eskiz.uz/api';
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private defaultNickname = '4546'; // Default Eskiz sender ID
  private isTestMode: boolean | null = null; // Cache test mode status

  // ==========================================================================
  // Authentication Methods
  // ==========================================================================

  /**
   * Get authentication token from Eskiz.uz
   * POST /auth/login
   */
  private async getToken(): Promise<string> {
    // Return cached token if still valid
    if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.token;
    }

    if (!env.ESKIZ_EMAIL || !env.ESKIZ_PASSWORD) {
      throw new Error('Eskiz credentials not configured. Set ESKIZ_EMAIL and ESKIZ_PASSWORD in .env');
    }

    const formData = new URLSearchParams();
    formData.append('email', env.ESKIZ_EMAIL);
    formData.append('password', env.ESKIZ_PASSWORD);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SMS] Eskiz auth failed:', error);
      throw new Error('Failed to authenticate with SMS provider');
    }

    const data = await response.json() as EskizTokenResponse;
    this.token = data.data.token;
    // Token expires in 30 days, but we refresh after 29 days
    this.tokenExpiresAt = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);

    console.log('[SMS] Eskiz token obtained successfully');
    return this.token;
  }

  /**
   * Refresh authentication token
   * PATCH /auth/refresh
   */
  async refreshToken(): Promise<string> {
    if (!this.token) {
      return this.getToken();
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        // If refresh fails, get a new token
        this.token = null;
        this.tokenExpiresAt = null;
        return this.getToken();
      }

      const data = await response.json() as EskizRefreshTokenResponse;
      this.token = data.data.token;
      this.tokenExpiresAt = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);

      console.log('[SMS] Eskiz token refreshed successfully');
      return this.token;
    } catch (error) {
      // If refresh fails, get a new token
      this.token = null;
      this.tokenExpiresAt = null;
      return this.getToken();
    }
  }

  /**
   * Invalidate current token
   * DELETE /auth/invalidate
   */
  async invalidateToken(): Promise<void> {
    if (!this.token) return;

    try {
      await fetch(`${this.baseUrl}/auth/invalidate`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      console.error('[SMS] Failed to invalidate token:', error);
    }

    this.token = null;
    this.tokenExpiresAt = null;
  }

  // ==========================================================================
  // Phone Number Formatting
  // ==========================================================================

  /**
   * Format phone number for Uzbekistan (998XXXXXXXXX)
   */
  private formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/[^0-9]/g, '');

    if (formatted.startsWith('998')) {
      // Already in correct format
    } else if (formatted.startsWith('0')) {
      formatted = '998' + formatted.substring(1);
    } else if (formatted.length === 9) {
      formatted = '998' + formatted;
    }

    return formatted;
  }

  // ==========================================================================
  // SMS Sending Methods
  // ==========================================================================

  /**
   * Check if account is in test mode
   */
  private async checkTestMode(): Promise<boolean> {
    if (this.isTestMode !== null) return this.isTestMode;

    try {
      const userInfo = await this.getUserInfo();
      this.isTestMode = userInfo.role === 'test' || userInfo.status === 'inactive';
      if (this.isTestMode) {
        console.warn('[SMS] ⚠️  Eskiz account is in TEST MODE. Only test messages can be sent.');
        console.warn('[SMS] Allowed test messages: "Bu Eskiz dan test", "Это тест от Eskiz", "This is test from Eskiz"');
        console.warn('[SMS] To activate: top up balance or contact Eskiz support');
      }
      return this.isTestMode;
    } catch {
      return false;
    }
  }

  /**
   * Send single SMS message
   * POST /message/sms/send
   */
  async sendSms(phone: string, message: string, from?: string): Promise<EskizSmsResponse> {
    // Check if SMS is enabled
    if (!env.SMS_ENABLED) {
      console.log(`[SMS] SMS disabled. Would send to ${phone}: ${message}`);
      return { id: 'mock-id', status: 'disabled', message: 'SMS disabled in config' };
    }

    const token = await this.getToken();
    const formattedPhone = this.formatPhoneNumber(phone);

    // Check if in test mode
    const isTest = await this.checkTestMode();
    if (isTest) {
      console.log(`[SMS] TEST MODE - Would send to ${formattedPhone}: ${message}`);
      console.log(`[SMS] TEST MODE - OTP codes are logged in console but SMS not actually sent`);
      // In test mode, return success but don't actually send (to avoid errors)
      return {
        id: `test-${Date.now()}`,
        status: 'test_mode',
        message: 'Account in test mode - SMS logged but not sent. Check console for OTP.'
      };
    }

    const formData = new URLSearchParams();
    formData.append('mobile_phone', formattedPhone);
    formData.append('message', message);
    formData.append('from', from || this.defaultNickname);

    const response = await fetch(`${this.baseUrl}/message/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SMS] Send failed:', response.status, errorText);

      // Parse error for better message
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message?.includes('теста') || errorJson.message?.includes('test')) {
          console.error('[SMS] ⚠️  Account is in TEST MODE. Activate account to send real SMS.');
          this.isTestMode = true;
        }
      } catch {
        // Not JSON error
      }

      // If unauthorized, try refreshing token and retry once
      if (response.status === 401) {
        await this.refreshToken();
        return this.sendSms(phone, message, from);
      }

      throw new Error(`Failed to send SMS: ${errorText}`);
    }

    const data = await response.json() as EskizSmsResponse;
    console.log(`[SMS] Message sent to ${formattedPhone}: ${data.id}`);
    return data;
  }

  /**
   * Send SMS with callback URL for delivery status
   * POST /message/sms/send
   */
  async sendSmsWithCallback(
    phone: string,
    message: string,
    callbackUrl: string,
    from?: string
  ): Promise<EskizSmsResponse> {
    if (!env.SMS_ENABLED) {
      console.log(`[SMS] SMS disabled. Would send to ${phone}: ${message}`);
      return { id: 'mock-id', status: 'disabled', message: 'SMS disabled in config' };
    }

    const token = await this.getToken();
    const formattedPhone = this.formatPhoneNumber(phone);

    const formData = new URLSearchParams();
    formData.append('mobile_phone', formattedPhone);
    formData.append('message', message);
    formData.append('from', from || this.defaultNickname);
    formData.append('callback_url', callbackUrl);

    const response = await fetch(`${this.baseUrl}/message/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SMS] Send with callback failed:', error);
      throw new Error(`Failed to send SMS: ${error}`);
    }

    const data = await response.json() as EskizSmsResponse;
    console.log(`[SMS] Message sent to ${formattedPhone} with callback: ${data.id}`);
    return data;
  }

  /**
   * Send batch SMS messages
   * POST /message/sms/send-batch
   */
  async sendBatchSms(
    messages: Array<{ phone: string; message: string; userSmsId?: string }>,
    from?: string,
    dispatchId?: string
  ): Promise<EskizBatchSmsResponse> {
    if (!env.SMS_ENABLED) {
      console.log(`[SMS] SMS disabled. Would send batch of ${messages.length} messages`);
      return { id: 'mock-batch-id', status: 'disabled', message: 'SMS disabled in config' };
    }

    const token = await this.getToken();

    const formattedMessages: EskizBatchSmsMessage[] = messages.map((msg, index) => ({
      user_sms_id: msg.userSmsId || `batch-${Date.now()}-${index}`,
      to: this.formatPhoneNumber(msg.phone),
      text: msg.message,
    }));

    const body: Record<string, unknown> = {
      messages: formattedMessages,
      from: from || this.defaultNickname,
    };

    if (dispatchId) {
      body.dispatch_id = dispatchId;
    }

    const response = await fetch(`${this.baseUrl}/message/sms/send-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SMS] Batch send failed:', error);
      throw new Error(`Failed to send batch SMS: ${error}`);
    }

    const data = await response.json() as EskizBatchSmsResponse;
    console.log(`[SMS] Batch of ${messages.length} messages sent: ${data.id}`);
    return data;
  }

  /**
   * Send international SMS
   * POST /message/sms/send-global
   */
  async sendGlobalSms(
    phone: string,
    message: string,
    countryCode: string
  ): Promise<EskizSmsResponse> {
    if (!env.SMS_ENABLED) {
      console.log(`[SMS] SMS disabled. Would send global SMS to ${countryCode}${phone}: ${message}`);
      return { id: 'mock-global-id', status: 'disabled', message: 'SMS disabled in config' };
    }

    const token = await this.getToken();

    const formData = new URLSearchParams();
    formData.append('mobile_phone', phone.replace(/[^0-9]/g, ''));
    formData.append('message', message);
    formData.append('country_code', countryCode);

    const response = await fetch(`${this.baseUrl}/message/sms/send-global`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SMS] Global send failed:', error);
      throw new Error(`Failed to send global SMS: ${error}`);
    }

    const data = await response.json() as EskizSmsResponse;
    console.log(`[SMS] Global message sent to ${countryCode}${phone}: ${data.id}`);
    return data;
  }

  // ==========================================================================
  // Status & History Methods
  // ==========================================================================

  /**
   * Get message status by ID
   * GET /message/sms/status/{id}
   */
  async getMessageStatus(messageId: string): Promise<EskizMessageStatusResponse> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/message/sms/status/${messageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get message status: ${error}`);
    }

    return response.json() as Promise<EskizMessageStatusResponse>;
  }

  /**
   * Get dispatch status
   * GET /message/sms/dispatch-status/{dispatchId}
   */
  async getDispatchStatus(dispatchId: string): Promise<EskizDispatchStatusResponse> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/message/sms/dispatch-status/${dispatchId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get dispatch status: ${error}`);
    }

    return response.json() as Promise<EskizDispatchStatusResponse>;
  }

  // ==========================================================================
  // Account Methods
  // ==========================================================================

  /**
   * Get account balance
   * GET /auth/user
   */
  async getBalance(): Promise<number> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get balance: ${error}`);
    }

    const data = await response.json() as EskizUserInfoResponse;
    return data.data.balance;
  }

  /**
   * Get user info
   * GET /auth/user
   */
  async getUserInfo(): Promise<EskizUserInfoResponse['data']> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    const data = await response.json() as EskizUserInfoResponse;
    return data.data;
  }

  /**
   * Get user limit info
   * GET /auth/user/limit
   */
  async getUserLimit(): Promise<{ limit: number; used: number; remaining: number }> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/auth/user/limit`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user limit: ${error}`);
    }

    const data = await response.json() as EskizUserLimitResponse;
    return data.data;
  }

  /**
   * Get available nicknames (sender IDs)
   * GET /nick/me
   */
  async getNicknames(): Promise<EskizNickname[]> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/nick/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get nicknames: ${error}`);
    }

    const data = await response.json() as EskizNicknamesResponse;
    return data.data;
  }

  /**
   * Get SMS templates
   * GET /template
   */
  async getTemplates(): Promise<EskizTemplateResponse['data']> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/template`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get templates: ${error}`);
    }

    const data = await response.json() as EskizTemplateResponse;
    return data.data;
  }

  // ==========================================================================
  // OTP Methods (Application-specific)
  // ==========================================================================

  /**
   * Send OTP verification code
   */
  async sendOtp(phone: string, code: string): Promise<boolean> {
    const message = `Код подтверждения для входа в мобильное приложение WaterGo: ${code}`;

    try {
      await this.sendSms(phone, message);
      return true;
    } catch (error) {
      console.error('[SMS] Failed to send OTP:', error);
      throw error;
    }
  }

  /**
   * Send order status notification
   */
  async sendOrderNotification(phone: string, orderNumber: string, status: string): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      confirmed: `WaterGo: Buyurtma #${orderNumber} qabul qilindi.`,
      preparing: `WaterGo: Buyurtma #${orderNumber} tayyorlanmoqda.`,
      delivering: `WaterGo: Buyurtma #${orderNumber} yetkazib berilmoqda.`,
      delivered: `WaterGo: Buyurtma #${orderNumber} yetkazib berildi. Rahmat!`,
      cancelled: `WaterGo: Buyurtma #${orderNumber} bekor qilindi.`,
    };

    const message = statusMessages[status] || `WaterGo: Buyurtma #${orderNumber} holati: ${status}`;

    try {
      await this.sendSms(phone, message);
      return true;
    } catch (error) {
      console.error('[SMS] Failed to send order notification:', error);
      throw error;
    }
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  /**
   * Check if SMS service is configured and working
   */
  async healthCheck(): Promise<{
    configured: boolean;
    enabled: boolean;
    authenticated: boolean;
    balance?: number;
    error?: string;
  }> {
    const configured = !!(env.ESKIZ_EMAIL && env.ESKIZ_PASSWORD);
    const enabled = env.SMS_ENABLED;

    if (!configured) {
      return { configured: false, enabled, authenticated: false, error: 'Eskiz credentials not configured' };
    }

    if (!enabled) {
      return { configured: true, enabled: false, authenticated: false };
    }

    try {
      await this.getToken();
      const balance = await this.getBalance();
      return { configured: true, enabled: true, authenticated: true, balance };
    } catch (error) {
      return {
        configured: true,
        enabled: true,
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const smsService = new SmsService();
