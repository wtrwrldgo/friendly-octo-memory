import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
export declare function requireRoles(...allowedRoles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare function requireFirmAccess(req: Request, _res: Response, next: NextFunction): void;
export declare function requireBranchAccess(req: Request, _res: Response, next: NextFunction): void;
export declare function isAdmin(req: Request): boolean;
export declare function isFirmOwner(req: Request): boolean;
export declare function canManageFirm(req: Request, firmId: string): boolean;
//# sourceMappingURL=rbac.middleware.d.ts.map