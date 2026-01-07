import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../shared/errors/UnauthorizedError.js';
import type { UserRole } from '@prisma/client';

interface JwtPayload {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  firmId?: string;
  branchId?: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      phone: decoded.phone,
      role: decoded.role,
      firmId: decoded.firmId,
      branchId: decoded.branchId,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

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
  } catch {
    // Token invalid, but optional - continue without user
    next();
  }
}
