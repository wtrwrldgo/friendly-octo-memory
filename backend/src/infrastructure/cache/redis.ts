import { Redis } from 'ioredis';
import { config } from '../../config/index.js';
import { logger } from '../../shared/utils/logger.js';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redis.on('error', (error: Error) => {
      logger.error({ error: error.message }, 'Redis connection error');
    });

    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  await client.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis disconnected');
  }
}

export class CacheService {
  private redis: Redis;
  private prefix: string;

  constructor(prefix: string = 'watergo:') {
    this.redis = getRedisClient();
    this.prefix = prefix;
  }

  private key(k: string): string {
    return `${this.prefix}${k}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(this.key(key));
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(this.key(key), ttlSeconds, serialized);
    } else {
      await this.redis.set(this.key(key), serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(this.key(key));
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(this.key(pattern));
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(this.key(key));
    return result === 1;
  }
}

export const cacheService = new CacheService();
