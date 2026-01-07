import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        phone?: string;
        role: UserRole;
        firmId?: string;
        branchId?: string;
      };
    }
  }
}

export {};
