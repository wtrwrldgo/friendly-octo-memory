import bcrypt from 'bcrypt';
import { prisma } from '../../infrastructure/database/prisma.js';
import type { StaffRole } from '@prisma/client';

export const staffService = {
  async list(firmId?: string, branchId?: string) {
    const where: any = {};
    if (firmId) where.firm_id = firmId;
    if (branchId) where.branch_id = branchId;

    const staff = await prisma.staff.findMany({
      where,
      select: {
        id: true,
        firm_id: true,
        branch_id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        permissions: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        firms: { select: { id: true, name: true } },
        branches: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return staff;
  },

  async getById(id: string) {
    const staff = await prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        firm_id: true,
        branch_id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        permissions: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        firms: { select: { id: true, name: true } },
        branches: { select: { id: true, name: true } },
      },
    });

    return staff;
  },

  async create(data: {
    firmId: string;
    branchId?: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    role?: StaffRole;
    permissions?: string[];
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const staff = await prisma.staff.create({
      data: {
        firm_id: data.firmId,
        branch_id: data.branchId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        password_hash: passwordHash,
        role: data.role || 'OPERATOR',
        permissions: data.permissions || [],
      },
      select: {
        id: true,
        firm_id: true,
        branch_id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        permissions: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return staff;
  },

  async update(id: string, data: {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    role?: StaffRole;
    permissions?: string[];
    isActive?: boolean;
    branchId?: string | null;
  }) {
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) return null;

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.branchId !== undefined) updateData.branch_id = data.branchId;
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firm_id: true,
        branch_id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        permissions: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return staff;
  },

  async delete(id: string) {
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) return false;

    await prisma.staff.delete({ where: { id } });
    return true;
  },
};
