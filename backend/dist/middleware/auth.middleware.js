import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../shared/errors/UnauthorizedError.js';
export function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            phone: decoded.phone,
            role: decoded.role,
            firmId: decoded.firmId,
            branchId: decoded.branchId,
        };
        next();
    }
    catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        }
        else {
            next(new UnauthorizedError('Invalid or expired token'));
        }
    }
}
export function optionalAuth(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, config.jwt.secret);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                phone: decoded.phone,
                role: decoded.role,
                firmId: decoded.firmId,
                branchId: decoded.branchId,
            };
        }
        next();
    }
    catch {
        // Token invalid, but optional - continue without user
        next();
    }
}
//# sourceMappingURL=auth.middleware.js.map