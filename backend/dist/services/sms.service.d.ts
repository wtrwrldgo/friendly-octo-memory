interface EskizSmsResponse {
    id: string;
    status: string;
    message: string;
}
interface EskizBatchSmsResponse {
    id: string;
    status: string;
    message: string;
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
declare class SmsService {
    private baseUrl;
    private token;
    private tokenExpiresAt;
    private defaultNickname;
    private isTestMode;
    /**
     * Get authentication token from Eskiz.uz
     * POST /auth/login
     */
    private getToken;
    /**
     * Refresh authentication token
     * PATCH /auth/refresh
     */
    refreshToken(): Promise<string>;
    /**
     * Invalidate current token
     * DELETE /auth/invalidate
     */
    invalidateToken(): Promise<void>;
    /**
     * Format phone number for Uzbekistan (998XXXXXXXXX)
     */
    private formatPhoneNumber;
    /**
     * Check if account is in test mode
     */
    private checkTestMode;
    /**
     * Send single SMS message
     * POST /message/sms/send
     */
    sendSms(phone: string, message: string, from?: string): Promise<EskizSmsResponse>;
    /**
     * Send SMS with callback URL for delivery status
     * POST /message/sms/send
     */
    sendSmsWithCallback(phone: string, message: string, callbackUrl: string, from?: string): Promise<EskizSmsResponse>;
    /**
     * Send batch SMS messages
     * POST /message/sms/send-batch
     */
    sendBatchSms(messages: Array<{
        phone: string;
        message: string;
        userSmsId?: string;
    }>, from?: string, dispatchId?: string): Promise<EskizBatchSmsResponse>;
    /**
     * Send international SMS
     * POST /message/sms/send-global
     */
    sendGlobalSms(phone: string, message: string, countryCode: string): Promise<EskizSmsResponse>;
    /**
     * Get message status by ID
     * GET /message/sms/status/{id}
     */
    getMessageStatus(messageId: string): Promise<EskizMessageStatusResponse>;
    /**
     * Get dispatch status
     * GET /message/sms/dispatch-status/{dispatchId}
     */
    getDispatchStatus(dispatchId: string): Promise<EskizDispatchStatusResponse>;
    /**
     * Get account balance
     * GET /auth/user
     */
    getBalance(): Promise<number>;
    /**
     * Get user info
     * GET /auth/user
     */
    getUserInfo(): Promise<EskizUserInfoResponse['data']>;
    /**
     * Get user limit info
     * GET /auth/user/limit
     */
    getUserLimit(): Promise<{
        limit: number;
        used: number;
        remaining: number;
    }>;
    /**
     * Get available nicknames (sender IDs)
     * GET /nick/me
     */
    getNicknames(): Promise<EskizNickname[]>;
    /**
     * Get SMS templates
     * GET /template
     */
    getTemplates(): Promise<EskizTemplateResponse['data']>;
    /**
     * Send OTP verification code
     */
    sendOtp(phone: string, code: string): Promise<boolean>;
    /**
     * Send order status notification
     */
    sendOrderNotification(phone: string, orderNumber: string, status: string): Promise<boolean>;
    /**
     * Check if SMS service is configured and working
     */
    healthCheck(): Promise<{
        configured: boolean;
        enabled: boolean;
        authenticated: boolean;
        balance?: number;
        error?: string;
    }>;
}
export declare const smsService: SmsService;
export {};
//# sourceMappingURL=sms.service.d.ts.map