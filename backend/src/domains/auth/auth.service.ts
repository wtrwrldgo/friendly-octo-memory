import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '../../infrastructure/database/prisma.js';
import { config } from '../../config/index.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { UserRole } from '@prisma/client';
import type { StaffLoginInput } from './auth.schema.js';

interface StaffLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    firmId: string | null;
    branchId: string | null;
  };
  firm: {
    id: string;
    name: string;
    logoUrl: string | null;
    city: string | null;
    status: string;
    isVisibleInClientApp: boolean;
    rejectionReason: string | null;
    submittedAt: Date | null;
    approvedAt: Date | null;
  } | null;
}

// WaterGo admin credentials (stored here for dev - in production use env vars)
const WATERGO_ADMIN = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@watergo.com',
  password: 'admin123',
  name: 'WaterGo Admin',
};

class AuthService {
  async staffLogin(input: StaffLoginInput): Promise<StaffLoginResponse> {
    const { email, password } = input;

    // Check for WaterGo admin login first
    if (email === WATERGO_ADMIN.email) {
      if (password !== WATERGO_ADMIN.password) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Generate JWT token for WaterGo admin
      const token = jwt.sign(
        {
          id: WATERGO_ADMIN.id,
          email: WATERGO_ADMIN.email,
          role: UserRole.WATERGO_ADMIN,
          firmId: null,
          branchId: null,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      return {
        token,
        user: {
          id: WATERGO_ADMIN.id,
          email: WATERGO_ADMIN.email,
          name: WATERGO_ADMIN.name,
          role: 'WATERGO_ADMIN',
          firmId: WATERGO_ADMIN.id,
          branchId: null,
        },
        firm: {
          id: WATERGO_ADMIN.id,
          name: 'WaterGo',
          logoUrl: null,
          city: 'Tashkent',
          status: 'ACTIVE',
          isVisibleInClientApp: true,
          rejectionReason: null,
          submittedAt: null,
          approvedAt: null,
        },
      };
    }

    // Find staff by email
    const staff = await prisma.staff.findUnique({
      where: { email },
      include: {
        firms: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            city: true,
            status: true,
            is_visible_in_client_app: true,
            rejection_reason: true,
            submitted_at: true,
            approved_at: true,
          },
        },
      },
    });

    if (!staff) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!staff.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, staff.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Map StaffRole to UserRole for JWT
    const userRole = staff.role === 'OWNER' ? UserRole.FIRM_OWNER : UserRole.STAFF;

    // Generate JWT token (30d format)
    const token = jwt.sign(
      {
        id: staff.id,
        email: staff.email,
        role: userRole,
        firmId: staff.firm_id,
        branchId: staff.branch_id,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    // Transform firm data for response
    const firmData = staff.firms ? {
      id: staff.firms.id,
      name: staff.firms.name,
      logoUrl: staff.firms.logo_url,
      city: staff.firms.city,
      status: staff.firms.status,
      isVisibleInClientApp: staff.firms.is_visible_in_client_app,
      rejectionReason: staff.firms.rejection_reason,
      submittedAt: staff.firms.submitted_at,
      approvedAt: staff.firms.approved_at,
    } : null;

    return {
      token,
      user: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        firmId: staff.firm_id,
        branchId: staff.branch_id,
      },
      firm: firmData,
    };
  }

  async driverLogin(input: { driverId: string; code: string }) {
    // Find driver directly by ID using raw SQL (DB schema differs from Prisma)
    const drivers = await prisma.$queryRawUnsafe<Array<{
      id: string;
      firm_id: string | null;
      driver_number: number | null;
      vehicle_number: string | null;
      firm_name: string | null;
    }>>(
      `SELECT d.id, d.firm_id, d.driver_number, d.vehicle_number, f.name as firm_name
       FROM drivers d
       LEFT JOIN firms f ON d.firm_id = f.id
       WHERE d.id::text = $1
       LIMIT 1`,
      input.driverId
    );

    const driver = drivers[0];
    if (!driver) {
      throw new UnauthorizedError('Invalid driver ID');
    }

    // For now, use code "1234" for testing (dev mode)
    if (input.code !== '1234') {
      throw new UnauthorizedError('Invalid verification code');
    }

    const token = jwt.sign(
      { driverId: driver.id, role: 'DRIVER', firmId: driver.firm_id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    return {
      token,
      driver: {
        id: driver.id,
        firmId: driver.firm_id,
        driverNumber: driver.driver_number,
        vehicleNumber: driver.vehicle_number,
      },
      firm: driver.firm_id ? { id: driver.firm_id, name: driver.firm_name } : null,
    };
  }

  async adminLogin(input: { email: string; password: string }) {
    // Admin login - use staff with OWNER role as admin for now
    const staff = await prisma.staff.findFirst({
      where: {
        email: input.email,
        role: 'OWNER',
      },
    });

    if (!staff) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!staff.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isValid = await bcrypt.compare(input.password, staff.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: 'ADMIN' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    return {
      token,
      admin: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: 'ADMIN',
      },
    };
  }
}

export const authService = new AuthService();
