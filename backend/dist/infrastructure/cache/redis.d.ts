import { Redis } from 'ioredis';
export declare function getRedisClient(): Redis;
export declare function connectRedis(): Promise<void>;
export declare function disconnectRedis(): Promise<void>;
export declare class CacheService {
    private redis;
    private prefix;
    constructor(prefix?: string);
    private key;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    deletePattern(pattern: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=redis.d.ts.map