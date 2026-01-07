import { firmsRepository, FirmsRepository } from './firms.repository.js';
import { cacheService } from '../../infrastructure/cache/redis.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { logger } from '../../shared/utils/logger.js';
import type { firms, staff } from '@prisma/client';
import type { CreateFirmInput, UpdateFirmInput, ListFirmsQuery } from './firms.schema.js';

const CACHE_PREFIX = 'firms:';
const CACHE_TTL = 300; // 5 minutes

export class FirmsService {
  constructor(private repository: FirmsRepository = firmsRepository) {}

  // Public method for client app - only returns visible firms
  async listPublic(): Promise<firms[]> {
    return this.repository.findAllPublic();
  }

  async list(query: ListFirmsQuery): Promise<{ firms: firms[]; total: number }> {
    // List queries not cached to keep fresh data
    return this.repository.findAll(query);
  }

  async getById(id: string): Promise<firms> {
    // Try cache first
    const cached = await cacheService.get<firms>(`${CACHE_PREFIX}${id}`);
    if (cached) {
      logger.debug({ id }, 'Firm fetched from cache');
      return cached;
    }

    const firm = await this.repository.findById(id);
    if (!firm) {
      throw new NotFoundError('Firm');
    }

    // Cache the result
    await cacheService.set(`${CACHE_PREFIX}${id}`, firm, CACHE_TTL);

    return firm;
  }

  async create(data: CreateFirmInput): Promise<{ firm: firms; owner?: staff }> {
    const result = await this.repository.create(data);
    logger.info({ firmId: result.firm.id, hasOwner: !!result.owner }, 'Firm created');
    return result;
  }

  async update(id: string, data: UpdateFirmInput, requestingFirmId?: string): Promise<firms> {
    // Verify exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Firm');
    }

    // If firmId provided, verify ownership (firm owners can only update their own firm)
    if (requestingFirmId && requestingFirmId !== id) {
      throw new Error('Forbidden: You can only update your own firm');
    }

    const firm = await this.repository.update(id, data);

    // Invalidate cache
    await cacheService.delete(`${CACHE_PREFIX}${id}`);

    logger.info({ firmId: id }, 'Firm updated');
    return firm;
  }

  async delete(id: string): Promise<void> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Firm');
    }

    // Hard delete - permanently remove the firm
    await this.repository.delete(id);

    // Invalidate cache
    await cacheService.delete(`${CACHE_PREFIX}${id}`);

    logger.info({ firmId: id }, 'Firm deleted');
  }

  async hardDelete(id: string): Promise<void> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Firm');
    }

    await this.repository.delete(id);

    // Invalidate cache
    await cacheService.delete(`${CACHE_PREFIX}${id}`);

    logger.info({ firmId: id }, 'Firm hard deleted');
  }

  async submitForReview(id: string, requestingFirmId: string): Promise<firms> {
    const firm = await this.repository.findById(id);
    if (!firm) {
      throw new NotFoundError('Firm');
    }

    // Only the firm owner can submit their own firm
    if (id !== requestingFirmId) {
      throw new Error('Forbidden: You can only submit your own firm for review');
    }

    // Only DRAFT status firms can be submitted for review
    if (firm.status !== 'DRAFT') {
      throw new Error(`Cannot submit for review: firm is in ${firm.status} status, expected DRAFT`);
    }

    const updated = await this.repository.update(id, {
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
    });

    // Invalidate cache
    await cacheService.delete(`${CACHE_PREFIX}${id}`);

    logger.info({ firmId: id }, 'Firm submitted for review');
    return updated;
  }

  async approve(id: string): Promise<firms> {
    const firm = await this.repository.findById(id);
    if (!firm) {
      throw new NotFoundError('Firm');
    }

    // Only PENDING_REVIEW firms can be approved
    if (firm.status !== 'PENDING_REVIEW') {
      throw new Error(`Cannot approve: firm is in ${firm.status} status, expected PENDING_REVIEW`);
    }

    const updated = await this.repository.update(id, {
      status: 'ACTIVE',
      isActive: true,
      isVisibleInClientApp: true,
      approvedAt: new Date().toISOString(),
    });

    // Invalidate cache
    await cacheService.delete(`${CACHE_PREFIX}${id}`);

    logger.info({ firmId: id }, 'Firm approved');
    return updated;
  }

  async reject(id: string, reason: string): Promise<firms> {
    const firm = await this.repository.findById(id);
    if (!firm) {
      throw new NotFoundError('Firm');
    }

    // Only PENDING_REVIEW firms can be rejected
    if (firm.status !== 'PENDING_REVIEW') {
      throw new Error(`Cannot reject: firm is in ${firm.status} status, expected PENDING_REVIEW`);
    }

    const updated = await this.repository.update(id, {
      status: 'DRAFT',
      rejectionReason: reason,
    });

    // Invalidate cache
    await cacheService.delete(`${CACHE_PREFIX}${id}`);

    logger.info({ firmId: id, reason }, 'Firm rejected');
    return updated;
  }

  async reactivate(id: string): Promise<firms> {
    const firm = await this.repository.findById(id);
    if (!firm) {
      throw new NotFoundError('Firm');
    }

    // Only SUSPENDED firms can be reactivated
    if (firm.status !== 'SUSPENDED') {
      throw new Error(`Cannot reactivate: firm is in ${firm.status} status, expected SUSPENDED`);
    }

    const updated = await this.repository.update(id, {
      status: 'ACTIVE',
      isActive: true,
      isVisibleInClientApp: true,
    });

    // Invalidate cache
    await cacheService.delete(`${CACHE_PREFIX}${id}`);

    logger.info({ firmId: id }, 'Firm reactivated');
    return updated;
  }

  async suspend(id: string): Promise<firms> {
    const firm = await this.repository.findById(id);
    if (!firm) {
      throw new NotFoundError('Firm');
    }

    // Only ACTIVE firms can be suspended
    if (firm.status !== 'ACTIVE') {
      throw new Error(`Cannot suspend: firm is in ${firm.status} status, expected ACTIVE`);
    }

    const updated = await this.repository.update(id, {
      status: 'SUSPENDED',
      isActive: false,
      isVisibleInClientApp: false,
    });

    // Invalidate cache
    await cacheService.delete(`${CACHE_PREFIX}${id}`);

    logger.info({ firmId: id }, 'Firm suspended');
    return updated;
  }
}

export const firmsService = new FirmsService();
