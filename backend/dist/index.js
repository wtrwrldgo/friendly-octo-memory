import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './shared/utils/logger.js';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/prisma.js';
import { connectRedis, disconnectRedis } from './infrastructure/cache/redis.js';
async function bootstrap() {
    try {
        // Connect to database
        await connectDatabase();
        // Connect to Redis
        await connectRedis();
        // Create Express app
        const app = createApp();
        // Start server
        const server = app.listen(config.port, () => {
            logger.info({ port: config.port, env: config.env }, 'Server started');
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger.info({ signal }, 'Shutdown signal received');
            server.close(async () => {
                logger.info('HTTP server closed');
                await disconnectDatabase();
                await disconnectRedis();
                logger.info('All connections closed. Exiting.');
                process.exit(0);
            });
            // Force exit after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=index.js.map