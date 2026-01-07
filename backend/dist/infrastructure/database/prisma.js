import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/utils/logger.js';
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
        ],
    });
prisma.$on('query', (e) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` }, 'Prisma Query');
});
prisma.$on('error', (e) => {
    logger.error({ error: e.message }, 'Prisma Error');
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
export async function connectDatabase() {
    try {
        await prisma.$connect();
        logger.info('Database connected successfully');
    }
    catch (error) {
        logger.error({ error }, 'Failed to connect to database');
        throw error;
    }
}
export async function disconnectDatabase() {
    await prisma.$disconnect();
    logger.info('Database disconnected');
}
//# sourceMappingURL=prisma.js.map