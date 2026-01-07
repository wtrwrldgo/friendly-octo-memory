import { prisma } from '../../infrastructure/database/prisma.js';
export class BranchesRepository {
    async findAll(query) {
        const { page, limit, firmId, cityId, isActive, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (firmId) {
            where.firm_id = firmId;
        }
        if (cityId) {
            where.city_id = cityId;
        }
        if (isActive !== undefined) {
            where.is_active = isActive;
        }
        // Map sortBy to snake_case
        const fieldMapping = {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            isActive: 'is_active',
            firmId: 'firm_id',
            cityId: 'city_id',
            deliveryFee: 'delivery_fee',
            etaMinutes: 'eta_minutes',
            isHeadquarters: 'is_headquarters',
        };
        const sortField = fieldMapping[sortBy] || sortBy;
        const orderBy = {
            [sortField]: sortOrder,
        };
        const [branchList, total] = await Promise.all([
            prisma.branches.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    firms: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    cities: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: { staff: true, orders: true, drivers: true },
                    },
                },
            }),
            prisma.branches.count({ where }),
        ]);
        return { branches: branchList, total };
    }
    async findById(id) {
        return prisma.branches.findUnique({
            where: { id },
            include: {
                firms: {
                    select: {
                        id: true,
                        name: true,
                        logo_url: true,
                    },
                },
                cities: {
                    select: {
                        id: true,
                        name: true,
                        regions: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { staff: true, orders: true, drivers: true },
                },
            },
        });
    }
    async findByFirmId(firmId) {
        return prisma.branches.findMany({
            where: { firm_id: firmId, is_active: true },
            include: {
                cities: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async create(data) {
        return prisma.branches.create({
            data: {
                firm_id: data.firmId,
                city_id: data.cityId,
                name: data.name,
                is_headquarters: data.isHeadquarters ?? false,
                delivery_fee: data.deliveryFee ?? 0,
                eta_minutes: data.etaMinutes ?? 30,
                is_active: data.isActive ?? true,
                updated_at: new Date(),
            },
            include: {
                firms: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                cities: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async update(id, data) {
        const updateData = { updated_at: new Date() };
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.cityId !== undefined)
            updateData.city_id = data.cityId;
        if (data.isHeadquarters !== undefined)
            updateData.is_headquarters = data.isHeadquarters;
        if (data.deliveryFee !== undefined)
            updateData.delivery_fee = data.deliveryFee;
        if (data.etaMinutes !== undefined)
            updateData.eta_minutes = data.etaMinutes;
        if (data.isActive !== undefined)
            updateData.is_active = data.isActive;
        return prisma.branches.update({
            where: { id },
            data: updateData,
            include: {
                firms: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                cities: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async delete(id) {
        await prisma.branches.delete({
            where: { id },
        });
    }
    async softDelete(id) {
        return prisma.branches.update({
            where: { id },
            data: { is_active: false, updated_at: new Date() },
        });
    }
    async exists(id) {
        const count = await prisma.branches.count({
            where: { id },
        });
        return count > 0;
    }
    async belongsToFirm(branchId, firmId) {
        const count = await prisma.branches.count({
            where: { id: branchId, firm_id: firmId },
        });
        return count > 0;
    }
}
export const branchesRepository = new BranchesRepository();
//# sourceMappingURL=branches.repository.js.map