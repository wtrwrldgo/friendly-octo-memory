import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    CORS_ORIGINS: z.ZodDefault<z.ZodString>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodNumber>;
    RATE_LIMIT_MAX_REQUESTS: z.ZodDefault<z.ZodNumber>;
    ESKIZ_EMAIL: z.ZodOptional<z.ZodString>;
    ESKIZ_PASSWORD: z.ZodOptional<z.ZodString>;
    SMS_ENABLED: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGINS: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    SMS_ENABLED: boolean;
    ESKIZ_EMAIL?: string | undefined;
    ESKIZ_PASSWORD?: string | undefined;
}, {
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: number | undefined;
    JWT_EXPIRES_IN?: string | undefined;
    CORS_ORIGINS?: string | undefined;
    RATE_LIMIT_WINDOW_MS?: number | undefined;
    RATE_LIMIT_MAX_REQUESTS?: number | undefined;
    ESKIZ_EMAIL?: string | undefined;
    ESKIZ_PASSWORD?: string | undefined;
    SMS_ENABLED?: string | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGINS: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    SMS_ENABLED: boolean;
    ESKIZ_EMAIL?: string | undefined;
    ESKIZ_PASSWORD?: string | undefined;
};
export {};
//# sourceMappingURL=env.d.ts.map