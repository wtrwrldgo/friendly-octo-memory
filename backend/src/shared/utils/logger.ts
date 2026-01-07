import pino from 'pino';
import { config } from '../../config/index.js';

export const logger = pino({
  level: config.isDevelopment ? 'debug' : 'info',
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: config.env,
  },
});

export const createChildLogger = (context: Record<string, unknown>) =>
  logger.child(context);
