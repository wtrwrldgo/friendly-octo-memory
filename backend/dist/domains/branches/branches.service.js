import { branchesRepository } from './branches.repository.js';
import { cacheService } from '../../infrastructure/cache/redis.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { logger } from '../../shared/utils/logger.js';
const CACHE_PREFIX = 'branches:';
const CACHE_TTL = 300; // 5 minutes
export class BranchesService {
    repository;
    constructor(repository = branchesRepository) {
        this.repository = repository;
    }
    async list(query) {
        return this.repository.findAll(query);
    }
    async getById(id) {
        const cached = await cacheService.get(`${CACHE_PREFIX}${id}`);
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
    async getByFirmId(firmId) {
        return this.repository.findByFirmId(firmId);
    }
    async create(data) {
        const branch = await this.repository.create(data);
        logger.info({ branchId: branch.id, firmId: data.firmId }, 'Branch created');
        return branch;
    }
    async update(id, data) {
        const exists = await this.repository.exists(id);
        if (!exists) {
            throw new NotFoundError('Branch');
        }
        const branch = await this.repository.update(id, data);
        await cacheService.delete(`${CACHE_PREFIX}${id}`);
        logger.info({ branchId: id }, 'Branch updated');
        return branch;
    }
    async delete(id) {
        const exists = await this.repository.exists(id);
        if (!exists) {
            throw new NotFoundError('Branch');
        }
        await this.repository.softDelete(id);
        await cacheService.delete(`${CACHE_PREFIX}${id}`);
        logger.info({ branchId: id }, 'Branch soft deleted');
    }
    async hardDelete(id) {
        const exists = await this.repository.exists(id);
        if (!exists) {
            throw new NotFoundError('Branch');
        }
        await this.repository.delete(id);
        await cacheService.delete(`${CACHE_PREFIX}${id}`);
        logger.info({ branchId: id }, 'Branch hard deleted');
    }
    async belongsToFirm(branchId, firmId) {
        return this.repository.belongsToFirm(branchId, firmId);
    }
}
export const branchesService = new BranchesService();
//# sourceMappingURL=branches.service.js.map