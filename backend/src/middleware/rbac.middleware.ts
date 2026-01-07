import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError } from '../shared/errors/ForbiddenError.js';
import { UnauthorizedError } from '../shared/errors/UnauthorizedError.js';

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}

export function requireFirmAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  // WaterGo admins have access to all firms
  if (req.user.role === UserRole.WATERGO_ADMIN) {
    next();
    return;
  }

  // Check if user's firm matches the requested firm
  const firmId = req.params.firmId || req.body?.firmId;
  if (firmId && req.user.firmId !== firmId) {
    next(new ForbiddenError('Access denied to this firm'));
    return;
  }

  next();
}

export function requireBranchAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  // WaterGo admins and firm owners have access to all branches in their firm
  if (req.user.role === UserRole.WATERGO_ADMIN || req.user.role === UserRole.FIRM_OWNER) {
    next();
    return;
  }

  // Staff/drivers must be assigned to the specific branch
  const branchId = req.params.branchId || req.body?.branchId;
  if (branchId && req.user.branchId !== branchId) {
    next(new ForbiddenError('Access denied to this branch'));
    return;
  }

  next();
}

// Helper to check if user is admin
export function isAdmin(req: Request): boolean {
  return req.user?.role === UserRole.WATERGO_ADMIN;
}

// Helper to check if user is firm owner
export function isFirmOwner(req: Request): boolean {
  return req.user?.role === UserRole.FIRM_OWNER;
}

// Helper to check if user can manage firm
export function canManageFirm(req: Request, firmId: string): boolean {
  if (!req.user) return false;
  if (req.user.role === UserRole.WATERGO_ADMIN) return true;
  if (req.user.role === UserRole.FIRM_OWNER && req.user.firmId === firmId) return true;
  return false;
}
