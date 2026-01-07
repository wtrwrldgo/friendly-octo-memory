import { geographyRepository, GeographyRepository } from './geography.repository.js';
import { cacheService } from '../../infrastructure/cache/redis.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import { logger } from '../../shared/utils/logger.js';
import type { regions, cities } from '@prisma/client';
import type { CreateRegionInput, UpdateRegionInput, CreateCityInput, UpdateCityInput, ListCitiesQuery } from './geography.schema.js';

const CACHE_PREFIX = 'geography:';
const CACHE_TTL = 3600; // 1 hour - geography data changes rarely

export class GeographyService {
  constructor(private repository: GeographyRepository = geographyRepository) {}

  // Region methods
  async listRegions(includeInactive = false): Promise<regions[]> {
    const cacheKey = `${CACHE_PREFIX}regions:${includeInactive}`;
    const cached = await cacheService.get<regions[]>(cacheKey);
    if (cached) {
      logger.debug('Regions fetched from cache');
      return cached;
    }

    const regions = await this.repository.findAllRegions(includeInactive);
    await cacheService.set(cacheKey, regions, CACHE_TTL);
    return regions;
  }

  async getRegionById(id: string): Promise<regions> {
    const cacheKey = `${CACHE_PREFIX}region:${id}`;
    const cached = await cacheService.get<regions>(cacheKey);
    if (cached) {
      logger.debug({ id }, 'Region fetched from cache');
      return cached;
    }

    const region = await this.repository.findRegionById(id);
    if (!region) {
      throw new NotFoundError('Region');
    }

    await cacheService.set(cacheKey, region, CACHE_TTL);
    return region;
  }

  async createRegion(data: CreateRegionInput): Promise<regions> {
    const existing = await this.repository.findRegionByCode(data.code);
    if (existing) {
      throw new ValidationError({ code: ['Region with this code already exists'] });
    }

    const region = await this.repository.createRegion(data);
    await this.invalidateRegionsCache();
    logger.info({ regionId: region.id }, 'Region created');
    return region;
  }

  async updateRegion(id: string, data: UpdateRegionInput): Promise<regions> {
    const exists = await this.repository.regionExists(id);
    if (!exists) {
      throw new NotFoundError('Region');
    }

    if (data.code) {
      const existing = await this.repository.findRegionByCode(data.code);
      if (existing && existing.id !== id) {
        throw new ValidationError({ code: ['Region with this code already exists'] });
      }
    }

    const region = await this.repository.updateRegion(id, data);
    await this.invalidateRegionsCache();
    await cacheService.delete(`${CACHE_PREFIX}region:${id}`);
    logger.info({ regionId: id }, 'Region updated');
    return region;
  }

  async deleteRegion(id: string): Promise<void> {
    const exists = await this.repository.regionExists(id);
    if (!exists) {
      throw new NotFoundError('Region');
    }

    await this.repository.deleteRegion(id);
    await this.invalidateRegionsCache();
    await cacheService.delete(`${CACHE_PREFIX}region:${id}`);
    logger.info({ regionId: id }, 'Region deleted');
  }

  // City methods
  async listCities(query: ListCitiesQuery): Promise<cities[]> {
    return this.repository.findAllCities(query);
  }

  async getCityById(id: string): Promise<cities> {
    const cacheKey = `${CACHE_PREFIX}city:${id}`;
    const cached = await cacheService.get<cities>(cacheKey);
    if (cached) {
      logger.debug({ id }, 'City fetched from cache');
      return cached;
    }

    const city = await this.repository.findCityById(id);
    if (!city) {
      throw new NotFoundError('City');
    }

    await cacheService.set(cacheKey, city, CACHE_TTL);
    return city;
  }

  async getCitiesByRegionId(regionId: string): Promise<cities[]> {
    const regionExists = await this.repository.regionExists(regionId);
    if (!regionExists) {
      throw new NotFoundError('Region');
    }

    return this.repository.findCitiesByRegionId(regionId);
  }

  async createCity(data: CreateCityInput): Promise<cities> {
    const regionExists = await this.repository.regionExists(data.regionId);
    if (!regionExists) {
      throw new ValidationError({ regionId: ['Region not found'] });
    }

    const city = await this.repository.createCity(data);
    logger.info({ cityId: city.id, regionId: data.regionId }, 'City created');
    return city;
  }

  async updateCity(id: string, data: UpdateCityInput): Promise<cities> {
    const exists = await this.repository.cityExists(id);
    if (!exists) {
      throw new NotFoundError('City');
    }

    const city = await this.repository.updateCity(id, data);
    await cacheService.delete(`${CACHE_PREFIX}city:${id}`);
    logger.info({ cityId: id }, 'City updated');
    return city;
  }

  async deleteCity(id: string): Promise<void> {
    const exists = await this.repository.cityExists(id);
    if (!exists) {
      throw new NotFoundError('City');
    }

    await this.repository.deleteCity(id);
    await cacheService.delete(`${CACHE_PREFIX}city:${id}`);
    logger.info({ cityId: id }, 'City deleted');
  }

  private async invalidateRegionsCache(): Promise<void> {
    await cacheService.deletePattern(`${CACHE_PREFIX}regions:*`);
  }
}

export const geographyService = new GeographyService();
