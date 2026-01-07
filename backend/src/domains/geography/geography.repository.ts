import { prisma } from '../../infrastructure/database/prisma.js';
import type { regions, cities, Prisma } from '@prisma/client';
import type { CreateRegionInput, UpdateRegionInput, CreateCityInput, UpdateCityInput, ListCitiesQuery } from './geography.schema.js';

export class GeographyRepository {
  // Region methods
  async findAllRegions(includeInactive = false): Promise<regions[]> {
    const where: Prisma.regionsWhereInput = includeInactive ? {} : { is_active: true };
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

  async findRegionById(id: string): Promise<regions | null> {
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

  async findRegionByCode(code: string): Promise<regions | null> {
    return prisma.regions.findUnique({
      where: { code },
    });
  }

  async createRegion(data: CreateRegionInput): Promise<regions> {
    return prisma.regions.create({
      data: {
        name: data.name,
        code: data.code,
        is_active: data.isActive ?? true,
      },
    });
  }

  async updateRegion(id: string, data: UpdateRegionInput): Promise<regions> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    return prisma.regions.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteRegion(id: string): Promise<void> {
    await prisma.regions.delete({
      where: { id },
    });
  }

  async regionExists(id: string): Promise<boolean> {
    const count = await prisma.regions.count({
      where: { id },
    });
    return count > 0;
  }

  // City methods
  async findAllCities(query: ListCitiesQuery): Promise<cities[]> {
    const where: Prisma.citiesWhereInput = {};

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

  async findCityById(id: string): Promise<cities | null> {
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

  async findCitiesByRegionId(regionId: string): Promise<cities[]> {
    return prisma.cities.findMany({
      where: { region_id: regionId, is_active: true },
      orderBy: [
        { is_country_capital: 'desc' },
        { is_region_capital: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async createCity(data: CreateCityInput): Promise<cities> {
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

  async updateCity(id: string, data: UpdateCityInput): Promise<cities> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.isRegionCapital !== undefined) updateData.is_region_capital = data.isRegionCapital;
    if (data.isCountryCapital !== undefined) updateData.is_country_capital = data.isCountryCapital;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

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

  async deleteCity(id: string): Promise<void> {
    await prisma.cities.delete({
      where: { id },
    });
  }

  async cityExists(id: string): Promise<boolean> {
    const count = await prisma.cities.count({
      where: { id },
    });
    return count > 0;
  }
}

export const geographyRepository = new GeographyRepository();
