export class EskizService {
    private static instance: EskizService;
    private token: string | null = null;
    private tokenExpiration: number = 0;
    private baseUrl = 'https://notify.eskiz.uz/api';

    private constructor() { }

    public static getInstance(): EskizService {
        if (!EskizService.instance) {
            EskizService.instance = new EskizService();
        }
        return EskizService.instance;
    }

    /**
     * Get a valid authentication token.
     * If the current token is missing or expired, it requests a new one.
     */
    private async getToken(): Promise<string> {
        const email = process.env.ESKIZ_EMAIL;
        const password = process.env.ESKIZ_PASSWORD;

        if (!email || !password) {
            throw new Error('ESKIZ_EMAIL and ESKIZ_PASSWORD environment variables are not set.');
        }

        // Return cached token if valid
        if (this.token && Date.now() < this.tokenExpiration) {
            return this.token;
        }

        try {
            console.log(`[EskizService] Authenticating with email: ${email}`);

            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[EskizService] Authentication Failed:', data);
                throw new Error(data.message || 'Failed to authenticate with Eskiz.uz');
            }

            this.token = data.data.token;
            // Set expiration to 29 days (tokens usually last 30 days)
            this.tokenExpiration = Date.now() + (29 * 24 * 60 * 60 * 1000);

            console.log('[EskizService] Authentication successful. Token obtained.');
            return this.token!;
        } catch (error: any) {
            console.error('[EskizService] Auth Error:', error.message);
            throw error;
        }
    }

    /**
     * Send an SMS message to a phone number.
     * @param phone Phone number in international format (e.g., 998901234567) - purely digits preferably
     * @param message Text message content
     */
    public async sendSMS(phone: string, message: string): Promise<boolean> {
        try {
            console.log(`[EskizService] Attempting to send SMS to ${phone}`);
            const token = await this.getToken();

            // Remove any non-digit characters from phone
            const cleanPhone = phone.replace(/\D/g, '');
            console.log(`[EskizService] Formatted phone: ${cleanPhone}`);

            const formData = new FormData();
            formData.append('mobile_phone', cleanPhone);
            formData.append('message', message);
            formData.append('from', '4546'); // Standard test sender ID 
            // formData.append('callback_url', 'http://0000.uz/test.php'); // Optional

            const response = await fetch(`${this.baseUrl}/message/sms/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[EskizService] Send SMS API Error:', JSON.stringify(data, null, 2));

                // Handle specific error: "Limit of messages is exceeded"
                if (data.message && data.message.includes('Limit')) {
                    console.error('[EskizService] CRITICAL: SMS Limit Exceeded');
                }

                return false;
            }

            console.log('[EskizService] SMS Sent Successfully. Response:', JSON.stringify(data, null, 2));
            return true;
        } catch (error: any) {
            console.error('[EskizService] Send SMS Exception:', error.message);
            if (error.cause) console.error('Cause:', error.cause);
            return false;
        }
    }
}

export const eskizService = EskizService.getInstance();
