import type { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../infrastructure/cache/redis.js';
import { logger } from '../shared/utils/logger.js';
import { sendError } from '../shared/utils/response.js';

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Redis key prefix
  skipFailedRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyPrefix = 'rl:',
    skipFailedRequests = false,
  } = options;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = getRedisClient();

      // Create unique key based on IP and optionally user ID
      const identifier = req.user?.id || req.ip || 'unknown';
      const key = `${keyPrefix}${identifier}:${req.path}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));

      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

      if (current > maxRequests) {
        logger.warn(
          { ip: req.ip, path: req.path, identifier },
          'Rate limit exceeded'
        );
        sendError(res, 'Too many requests, please try again later', 429, 'RATE_LIMIT_EXCEEDED');
        return;
      }

      // Optionally decrement on failed request
      if (skipFailedRequests) {
        res.on('finish', async () => {
          if (res.statusCode >= 400) {
            await redis.decr(key);
          }
        });
      }

      next();
    } catch (error) {
      // On Redis error, log and continue (fail open)
      logger.error({ error }, 'Rate limiter error');
      next();
    }
  };
}

// Pre-configured rate limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  keyPrefix: 'rl:auth:',
  skipFailedRequests: true,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  keyPrefix: 'rl:api:',
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyPrefix: 'rl:strict:',
});
