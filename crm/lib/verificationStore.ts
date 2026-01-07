/**
 * Simple in-memory storage for verification codes.
 * NOTE: This is for development/MVP purposes. 
 * In production serverless environments, this will NOT persist across cold starts.
 * For production, use Redis or a database table.
 */

interface VerificationData {
    code: string;
    expiresAt: number;
}

const verificationStore = new Map<string, VerificationData>();

export const VerificationStore = {
    /**
     * Store a verification code for a phone number
     */
    set: (phone: string, code: string, ttlSeconds: number = 600) => {
        verificationStore.set(phone, {
            code,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
        console.log(`[VerificationStore] Stored code for ${phone}`);
    },

    /**
     * Get and validate a verification code
     */
    verify: (phone: string, code: string): boolean => {
        const data = verificationStore.get(phone);

        if (!data) {
            console.log(`[VerificationStore] No code found for ${phone}`);
            return false;
        }

        if (Date.now() > data.expiresAt) {
            console.log(`[VerificationStore] Code expired for ${phone}`);
            verificationStore.delete(phone);
            return false;
        }

        if (data.code !== code) {
            console.log(`[VerificationStore] Invalid code for ${phone}: expected ${data.code}, got ${code}`);
            return false;
        }

        // Code matches and is valid
        verificationStore.delete(phone); // Consume code
        return true;
    },

    /**
     * For debugging
     */
    get: (phone: string) => verificationStore.get(phone)
};
