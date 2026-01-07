import { env } from './env.js';
export declare const config: {
    readonly env: "development" | "production" | "test";
    readonly port: number;
    readonly isProduction: boolean;
    readonly isDevelopment: boolean;
    readonly database: {
        readonly url: string;
    };
    readonly redis: {
        readonly url: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
    };
    readonly cors: {
        readonly origins: string[];
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
};
export { env };
//# sourceMappingURL=index.d.ts.map