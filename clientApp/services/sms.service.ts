/**
 * SMS Service
 *
 * Handles SMS verification via the CRM API (which uses Eskiz.uz or other providers)
 */

interface SendSMSResponse {
    success: boolean;
    message?: string;
    error?: string;
}

class SmsService {
    // Use the API URL from environment, or fallback to localhost for dev
    private apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

    /**
     * Send verification code via SMS by calling the CRM API
     */
    async sendVerificationCode(phone: string, code: string): Promise<SendSMSResponse> {
        try {
            console.log(`Sending SMS to ${phone} via ${this.apiUrl}/send-sms`);

            const response = await fetch(`${this.apiUrl}/send-sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone,
                    code,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Failed to send SMS',
                };
            }

            return {
                success: data.success,
                message: data.message,
            };
        } catch (error: any) {
            console.error('Error sending SMS:', error);
            return {
                success: false,
                error: error.message || 'Network error',
            };
        }
    }

    /**
     * Generate a random 4-digit verification code
     */
    generateVerificationCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phone: string): boolean {
        // Basic validation for international phone numbers
        // Format: +[country code][number]
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Format phone number for display
     * Example: +998991234567 -> +998 99 123 45 67
     */
    formatPhoneNumber(phone: string): string {
        if (!phone) return '';

        // Remove all non-digit characters except +
        const cleaned = phone.replace(/[^\d+]/g, '');

        // For Uzbekistan numbers (+998)
        if (cleaned.startsWith('+998')) {
            const match = cleaned.match(/^(\+998)(\d{2})(\d{3})(\d{2})(\d{2})$/);
            if (match) {
                return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
            }
        }

        // Default: just return cleaned number
        return cleaned;
    }
}

export default new SmsService();
