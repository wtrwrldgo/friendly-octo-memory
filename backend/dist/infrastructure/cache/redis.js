import { Redis } from 'ioredis';
import { config } from '../../config/index.js';
import { logger } from '../../shared/utils/logger.js';
let redis = null;
export function getRedisClient() {
    if (!redis) {
        redis = new Redis(config.redis.url, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });
        redis.on('connect', () => {
            logger.info('Redis connected successfully');
        });
        redis.on('error', (error) => {
            logger.error({ error: error.message }, 'Redis connection error');
        });
        redis.on('close', () => {
            logger.warn('Redis connection closed');
        });
    }
    return redis;
}
export async function connectRedis() {
    const client = getRedisClient();
    await client.connect();
}
export async function disconnectRedis() {
    if (redis) {
        await redis.quit();
        redis = null;
        logger.info('Redis disconnected');
    }
}
export class CacheService {
    redis;
    prefix;
    constructor(prefix = 'watergo:') {
        this.redis = getRedisClient();
        this.prefix = prefix;
    }
    key(k) {
        return `${this.prefix}${k}`;
    }
    async get(key) {
        const data = await this.redis.get(this.key(key));
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
            await this.redis.setex(this.key(key), ttlSeconds, serialized);
        }
        else {
            await this.redis.set(this.key(key), serialized);
        }
    }
    async delete(key) {
        await this.redis.del(this.key(key));
    }
    async deletePattern(pattern) {
        const keys = await this.redis.keys(this.key(pattern));
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
    async exists(key) {
        const result = await this.redis.exists(this.key(key));
        return result === 1;
    }
}
export const cacheService = new CacheService();
//# sourceMappingURL=redis.js.map