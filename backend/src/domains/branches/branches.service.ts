import { branchesRepository, BranchesRepository } from './branches.repository.js';
import { cacheService } from '../../infrastructure/cache/redis.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { logger } from '../../shared/utils/logger.js';
import type { branches } from '@prisma/client';
import type { CreateBranchInput, UpdateBranchInput, ListBranchesQuery } from './branches.schema.js';

const CACHE_PREFIX = 'branches:';
const CACHE_TTL = 300; // 5 minutes

export class BranchesService {
  constructor(private repository: BranchesRepository = branchesRepository) {}

  async list(query: ListBranchesQuery): Promise<{ branches: branches[]; total: number }> {
    return this.repository.findAll(query);
  }

  async getById(id: string): Promise<branches> {
    const cached = await cacheService.get<branches>(`${CACHE_PREFIX}${id}`);
    if (cached) {
      logger.debug({ id }, 'Branch fetched from cache');
      return cached;
    }

    const branch = await this.repository.findById(id);
    if (!branch) {
      throw new NotFoundError('Branch');
    }

    await cacheService.set(`${CACHE_PREFIX}${id}`, branch, CACHE_TTL);
    return branch;
  }

  async getByFirmId(firmId: string): Promise<branches[]> {
    return this.repository.findByFirmId(firmId);
  }

  async create(data: CreateBranchInput): Promise<branches> {
    const branch = await this.repository.create(data);
    logger.info({ branchId: branch.id, firmId: data.firmId }, 'Branch created');
    return branch;
  }

  async update(id: string, data: UpdateBranchInput): Promise<branches> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Branch');
    }

    const branch = await this.repository.update(id, data);
    await cacheService.delete(`${CACHE_PREFIX}${id}`);
    logger.info({ branchId: id }, 'Branch updated');
    return branch;
  }

  async delete(id: string): Promise<void> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Branch');
    }

    await this.repository.softDelete(id);
    await cacheService.delete(`${CACHE_PREFIX}${id}`);
    logger.info({ branchId: id }, 'Branch soft deleted');
  }

  async hardDelete(id: string): Promise<void> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Branch');
    }

    await this.repository.delete(id);
    await cacheService.delete(`${CACHE_PREFIX}${id}`);
    logger.info({ branchId: id }, 'Branch hard deleted');
  }

  async belongsToFirm(branchId: string, firmId: string): Promise<boolean> {
    return this.repository.belongsToFirm(branchId, firmId);
  }
}

export const branchesService = new BranchesService();
