import { FirmsRepository } from './firms.repository.js';
import type { firms, staff } from '@prisma/client';
import type { CreateFirmInput, UpdateFirmInput, ListFirmsQuery } from './firms.schema.js';
export declare class FirmsService {
    private repository;
    constructor(repository?: FirmsRepository);
    listPublic(): Promise<firms[]>;
    list(query: ListFirmsQuery): Promise<{
        firms: firms[];
        total: number;
    }>;
    getById(id: string): Promise<firms>;
    create(data: CreateFirmInput): Promise<{
        firm: firms;
        owner?: staff;
    }>;
    update(id: string, data: UpdateFirmInput, requestingFirmId?: string): Promise<firms>;
    delete(id: string): Promise<void>;
    hardDelete(id: string): Promise<void>;
    submitForReview(id: string, requestingFirmId: string): Promise<firms>;
    approve(id: string): Promise<firms>;
    reject(id: string, reason: string): Promise<firms>;
    reactivate(id: string): Promise<firms>;
    suspend(id: string): Promise<firms>;
}
export declare const firmsService: FirmsService;
//# sourceMappingURL=firms.service.d.ts.map