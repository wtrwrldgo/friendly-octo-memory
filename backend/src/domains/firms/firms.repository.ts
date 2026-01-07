import bcrypt from 'bcrypt';
import { prisma } from '../../infrastructure/database/prisma.js';
import type { firms } from '@prisma/client';
import type { CreateFirmInput, UpdateFirmInput, ListFirmsQuery } from './firms.schema.js';

// Map camelCase to snake_case for Prisma fields
const fieldMapping: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  isActive: 'is_active',
  logoUrl: 'logo_url',
  deliveryTime: 'delivery_time',
  minOrder: 'min_order',
  minOrderEnabled: 'min_order_enabled',
  deliveryFee: 'delivery_fee',
  deliveryFeeEnabled: 'delivery_fee_enabled',
  deliveryFeeType: 'delivery_fee_type',
  deliveryFeePercent: 'delivery_fee_percent',
  homeBannerUrl: 'home_banner_url',
  detailBannerUrl: 'detail_banner_url',
  isVisibleInClientApp: 'is_visible_in_client_app',
  submittedAt: 'submitted_at',
  approvedAt: 'approved_at',
  rejectionReason: 'rejection_reason',
  subscriptionStatus: 'subscription_status',
  trialStartAt: 'trial_start_at',
  trialEndAt: 'trial_end_at',
  bottleDeposit: 'bottle_deposit',
  bottleDepositEnabled: 'bottle_deposit_enabled',
  bottleDepositPrice: 'bottle_deposit_price',
  scheduleDaysLimit: 'schedule_days_limit',
  scheduleTimeInterval: 'schedule_time_interval',
};

export class FirmsRepository {
  async findAll(query: ListFirmsQuery): Promise<{ firms: any[]; total: number }> {
    const { page, limit, search, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    // Map sortBy to snake_case
    const sortField = fieldMapping[sortBy] || sortBy;
    const orderBy: any = {
      [sortField]: sortOrder,
    };

    const [firms, total] = await Promise.all([
      prisma.firms.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { branches: true, products: true },
          },
        },
      }),
      prisma.firms.count({ where }),
    ]);

    return { firms, total };
  }

  async findById(id: string): Promise<any | null> {
    const firm = await prisma.firms.findUnique({
      where: { id },
      include: {
        branches: {
          where: { is_active: true },
          select: {
            id: true,
            name: true,
            city_id: true,
            delivery_fee: true,
            eta_minutes: true,
          },
        },
        products: {
          where: { in_stock: true },
          take: 10,
          select: {
            id: true,
            name: true,
            price: true,
            image_url: true,
          },
        },
        _count: {
          select: { branches: true, products: true, staff: true },
        },
      },
    });

    if (!firm) return null;

    // Transform snake_case to camelCase for consistency
    return {
      id: firm.id,
      name: firm.name,
      description: firm.description,
      address: firm.address,
      city: firm.city,
      logo: firm.logo_url,
      logoUrl: firm.logo_url,
      homeBanner: firm.home_banner_url,
      homeBannerUrl: firm.home_banner_url,
      detailBanner: firm.detail_banner_url,
      detailBannerUrl: firm.detail_banner_url,
      rating: firm.rating,
      deliveryTime: firm.delivery_time,
      minOrder: firm.min_order,
      minOrderEnabled: firm.min_order_enabled,
      deliveryFee: firm.delivery_fee,
      deliveryFeeEnabled: firm.delivery_fee_enabled,
      deliveryFeeType: firm.delivery_fee_type,
      deliveryFeePercent: firm.delivery_fee_percent,
      bottleDeposit: firm.bottle_deposit,
      bottleDepositEnabled: firm.bottle_deposit_enabled,
      bottleDepositPrice: firm.bottle_deposit_price,
      scheduleDaysLimit: firm.schedule_days_limit,
      scheduleTimeInterval: firm.schedule_time_interval,
      isActive: firm.is_active,
      isVisibleInClientApp: firm.is_visible_in_client_app,
      status: firm.status,
      submittedAt: firm.submitted_at,
      approvedAt: firm.approved_at,
      rejectionReason: firm.rejection_reason,
      subscriptionStatus: firm.subscription_status,
      trialStartAt: firm.trial_start_at,
      trialEndAt: firm.trial_end_at,
      createdAt: firm.created_at,
      updatedAt: firm.updated_at,
      branches: firm.branches,
      products: firm.products,
      _count: firm._count,
    };
  }

  async findByIdSimple(id: string): Promise<firms | null> {
    return prisma.firms.findUnique({
      where: { id },
    });
  }

  async create(data: CreateFirmInput): Promise<{ firm: any; owner?: any }> {
    const { owner, ...firmData } = data;

    // Calculate trial end date (30 days from now)
    const trialStartAt = new Date();
    const trialEndAt = new Date(trialStartAt);
    trialEndAt.setDate(trialEndAt.getDate() + 30);

    // Map camelCase input to snake_case for Prisma
    const firmDataSnake: any = {
      name: firmData.name,
      logo_url: firmData.logoUrl,
      home_banner_url: firmData.homeBannerUrl,
      detail_banner_url: firmData.detailBannerUrl,
      description: firmData.description,
      address: firmData.address,
      delivery_time: firmData.deliveryTime,
      min_order: firmData.minOrder,
      min_order_enabled: firmData.minOrderEnabled,
      delivery_fee: firmData.deliveryFee,
      delivery_fee_enabled: firmData.deliveryFeeEnabled,
      delivery_fee_type: firmData.deliveryFeeType,
      delivery_fee_percent: firmData.deliveryFeePercent,
      bottle_deposit: firmData.bottleDeposit,
      bottle_deposit_enabled: firmData.bottleDepositEnabled,
      bottle_deposit_price: firmData.bottleDepositPrice,
      schedule_days_limit: firmData.scheduleDaysLimit,
      schedule_time_interval: firmData.scheduleTimeInterval,
      is_active: firmData.isActive,
      trial_start_at: trialStartAt,
      trial_end_at: trialEndAt,
      subscription_status: 'TRIAL_ACTIVE',
    };

    // Remove undefined values
    Object.keys(firmDataSnake).forEach(key => {
      if (firmDataSnake[key] === undefined) delete firmDataSnake[key];
    });

    // If no owner, just create the firm
    if (!owner) {
      const firm = await prisma.firms.create({ data: firmDataSnake });
      return { firm };
    }

    // Create firm + owner in a transaction
    const passwordHash = await bcrypt.hash(owner.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Create firm first
      const firm = await tx.firms.create({ data: firmDataSnake });

      // Create owner staff member
      const ownerStaff = await tx.staff.create({
        data: {
          firm_id: firm.id,
          name: owner.name,
          phone: owner.phone,
          email: owner.email,
          password_hash: passwordHash,
          role: 'OWNER',
          permissions: [],
        },
      });

      return { firm, owner: ownerStaff };
    });

    return result;
  }

  async update(id: string, data: UpdateFirmInput): Promise<any> {
    // Map camelCase input to snake_case for Prisma
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
    if (data.homeBannerUrl !== undefined) updateData.home_banner_url = data.homeBannerUrl;
    if (data.detailBannerUrl !== undefined) updateData.detail_banner_url = data.detailBannerUrl;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.deliveryTime !== undefined) updateData.delivery_time = data.deliveryTime;
    if (data.minOrder !== undefined) updateData.min_order = data.minOrder;
    if (data.minOrderEnabled !== undefined) updateData.min_order_enabled = data.minOrderEnabled;
    if (data.deliveryFee !== undefined) updateData.delivery_fee = data.deliveryFee;
    if (data.deliveryFeeEnabled !== undefined) updateData.delivery_fee_enabled = data.deliveryFeeEnabled;
    if (data.deliveryFeeType !== undefined) updateData.delivery_fee_type = data.deliveryFeeType;
    if (data.deliveryFeePercent !== undefined) updateData.delivery_fee_percent = data.deliveryFeePercent;
    if (data.bottleDeposit !== undefined) updateData.bottle_deposit = data.bottleDeposit;
    if (data.bottleDepositEnabled !== undefined) updateData.bottle_deposit_enabled = data.bottleDepositEnabled;
    if (data.bottleDepositPrice !== undefined) updateData.bottle_deposit_price = data.bottleDepositPrice;
    if (data.scheduleDaysLimit !== undefined) updateData.schedule_days_limit = data.scheduleDaysLimit;
    if (data.scheduleTimeInterval !== undefined) updateData.schedule_time_interval = data.scheduleTimeInterval;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isVisibleInClientApp !== undefined) updateData.is_visible_in_client_app = data.isVisibleInClientApp;
    if (data.submittedAt !== undefined) updateData.submitted_at = data.submittedAt;
    if (data.approvedAt !== undefined) updateData.approved_at = data.approvedAt;
    if (data.rejectionReason !== undefined) updateData.rejection_reason = data.rejectionReason;

    return prisma.firms.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.firms.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<any> {
    return prisma.firms.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.firms.count({
      where: { id },
    });
    return count > 0;
  }

  // Public method - returns only ACTIVE firms that are visible in client app
  async findAllPublic(): Promise<any[]> {
    const firms = await prisma.firms.findMany({
      where: {
        status: 'ACTIVE',
        is_visible_in_client_app: true,
      },
      orderBy: { name: 'asc' },
    });

    // Transform snake_case to camelCase for client app
    return firms.map((firm) => ({
      id: firm.id,
      name: firm.name,
      description: firm.description,
      logo: firm.logo_url,
      logoUrl: firm.logo_url,
      homeBanner: firm.home_banner_url,
      homeBannerUrl: firm.home_banner_url,
      detailBanner: firm.detail_banner_url,
      detailBannerUrl: firm.detail_banner_url,
      rating: firm.rating,
      deliveryTime: firm.delivery_time,
      minOrder: firm.min_order,
      minOrderEnabled: firm.min_order_enabled,
      deliveryFee: firm.delivery_fee,
      deliveryFeeEnabled: firm.delivery_fee_enabled,
      bottleDeposit: firm.bottle_deposit,
      bottleDepositEnabled: firm.bottle_deposit_enabled,
      bottleDepositPrice: firm.bottle_deposit_price,
      scheduleDaysLimit: firm.schedule_days_limit,
      scheduleTimeInterval: firm.schedule_time_interval,
      location: firm.city,
      status: firm.status,
    }));
  }
}

export const firmsRepository = new FirmsRepository();
