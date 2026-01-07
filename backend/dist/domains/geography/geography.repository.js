import { prisma } from '../../infrastructure/database/prisma.js';
export class GeographyRepository {
    // Region methods
    async findAllRegions(includeInactive = false) {
        const where = includeInactive ? {} : { is_active: true };
        return prisma.regions.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { cities: true },
                },
            },
        });
    }
    async findRegionById(id) {
        return prisma.regions.findUnique({
            where: { id },
            include: {
                cities: {
                    where: { is_active: true },
                    orderBy: [
                        { is_country_capital: 'desc' },
                        { is_region_capital: 'desc' },
                        { name: 'asc' },
                    ],
                },
                _count: {
                    select: { cities: true },
                },
            },
        });
    }
    async findRegionByCode(code) {
        return prisma.regions.findUnique({
            where: { code },
        });
    }
    async createRegion(data) {
        return prisma.regions.create({
            data: {
                name: data.name,
                code: data.code,
                is_active: data.isActive ?? true,
            },
        });
    }
    async updateRegion(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.code !== undefined)
            updateData.code = data.code;
        if (data.isActive !== undefined)
            updateData.is_active = data.isActive;
        return prisma.regions.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteRegion(id) {
        await prisma.regions.delete({
            where: { id },
        });
    }
    async regionExists(id) {
        const count = await prisma.regions.count({
            where: { id },
        });
        return count > 0;
    }
    // City methods
    async findAllCities(query) {
        const where = {};
        if (query.regionId) {
            where.region_id = query.regionId;
        }
        if (query.isActive !== undefined) {
            where.is_active = query.isActive;
        }
        return prisma.cities.findMany({
            where,
            orderBy: [
                { is_country_capital: 'desc' },
                { is_region_capital: 'desc' },
                { name: 'asc' },
            ],
            include: {
                regions: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                _count: {
                    select: { branches: true },
                },
            },
        });
    }
    async findCityById(id) {
        return prisma.cities.findUnique({
            where: { id },
            include: {
                regions: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                _count: {
                    select: { branches: true },
                },
            },
        });
    }
    async findCitiesByRegionId(regionId) {
        return prisma.cities.findMany({
            where: { region_id: regionId, is_active: true },
            orderBy: [
                { is_country_capital: 'desc' },
                { is_region_capital: 'desc' },
                { name: 'asc' },
            ],
        });
    }
    async createCity(data) {
        return prisma.cities.create({
            data: {
                region_id: data.regionId,
                name: data.name,
                is_region_capital: data.isRegionCapital ?? false,
                is_country_capital: data.isCountryCapital ?? false,
                is_active: data.isActive ?? true,
            },
            include: {
                regions: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
    }
    async updateCity(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.isRegionCapital !== undefined)
            updateData.is_region_capital = data.isRegionCapital;
        if (data.isCountryCapital !== undefined)
            updateData.is_country_capital = data.isCountryCapital;
        if (data.isActive !== undefined)
            updateData.is_active = data.isActive;
        return prisma.cities.update({
            where: { id },
            data: updateData,
            include: {
                regions: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
    }
    async deleteCity(id) {
        await prisma.cities.delete({
            where: { id },
        });
    }
    async cityExists(id) {
        const count = await prisma.cities.count({
            where: { id },
        });
        return count > 0;
    }
}
export const geographyRepository = new GeographyRepository();
//# sourceMappingURL=geography.repository.js.map