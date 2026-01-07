import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler, apiLimiter } from './middleware/index.js';
import { logger } from './shared/utils/logger.js';
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Import domain routes
import { firmRoutes } from './domains/firms/index.js';
import { branchRoutes } from './domains/branches/index.js';
import { geographyRoutes } from './domains/geography/index.js';
import { authRoutes } from './domains/auth/index.js';
import { clientRoutes } from './domains/clients/index.js';
import { orderRoutes } from './domains/orders/index.js';
import { driverRoutes } from './domains/drivers/index.js';
import { productRoutes } from './domains/products/index.js';
import { uploadRoutes } from './domains/upload/index.js';
import { addressRoutes } from './domains/addresses/index.js';
import { staffRoutes } from './domains/staff/index.js';
import { subscriptionRoutes } from './domains/subscription/index.js';
import { userRoutes } from './domains/users/index.js';
import { pushTokenRoutes } from './domains/push-tokens/index.js';
import { paymentRoutes } from './domains/payment/index.js';
export function createApp() {
    const app = express();
    // Security middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(cors({
        origin: config.cors.origins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    // Serve static files from static folder
    // Path goes from dist -> ../static (project root)
    app.use('/static', express.static(path.join(__dirname, '..', 'static')));
    // Also serve uploaded files from public folder (multer saves to public/uploads/)
    // From dist/app.js, go one level up to backend/public/
    app.use('/static', express.static(path.join(__dirname, '..', 'public')));
    // Request logging
    app.use((req, _res, next) => {
        logger.debug({ method: req.method, path: req.path }, 'Incoming request');
        next();
    });
    // Health check (no rate limit)
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // API rate limiting
    app.use('/api', apiLimiter);
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/firms', firmRoutes);
    app.use('/api/branches', branchRoutes);
    app.use('/api/geography', geographyRoutes);
    app.use('/api/clients', clientRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/drivers', driverRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/addresses', addressRoutes);
    app.use('/api/staff', staffRoutes);
    app.use('/api/subscription', subscriptionRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/push-tokens', pushTokenRoutes);
    app.use('/api/payment', paymentRoutes);
    // 404 handler
    app.use(notFoundHandler);
    // Error handler (must be last)
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map