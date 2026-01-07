import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError.js';
import { logger } from '../shared/utils/logger.js';
import { sendError } from '../shared/utils/response.js';
import { config } from '../config/index.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  logger.error(
    {
      error: err.message,
      stack: config.isDevelopment ? err.stack : undefined,
      path: req.path,
      method: req.method,
    },
    'Error occurred'
  );

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(e.message);
    });
    sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
    return;
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code);
    return;
  }

  // Handle Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target?.join(', ') || 'field';
      sendError(res, `Duplicate value for ${target}`, 409, 'DUPLICATE_ERROR');
      return;
    }

    if (prismaError.code === 'P2025') {
      sendError(res, 'Record not found', 404, 'NOT_FOUND');
      return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    return;
  }

  // Default to 500 internal server error
  sendError(
    res,
    config.isDevelopment ? err.message : 'Internal server error',
    500,
    'INTERNAL_ERROR'
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
}
