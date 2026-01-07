import { BranchesRepository } from './branches.repository.js';
import type { branches } from '@prisma/client';
import type { CreateBranchInput, UpdateBranchInput, ListBranchesQuery } from './branches.schema.js';
export declare class BranchesService {
    private repository;
    constructor(repository?: BranchesRepository);
    list(query: ListBranchesQuery): Promise<{
        branches: branches[];
        total: number;
    }>;
    getById(id: string): Promise<branches>;
    getByFirmId(firmId: string): Promise<branches[]>;
    create(data: CreateBranchInput): Promise<branches>;
    update(id: string, data: UpdateBranchInput): Promise<branches>;
    delete(id: string): Promise<void>;
    hardDelete(id: string): Promise<void>;
    belongsToFirm(branchId: string, firmId: string): Promise<boolean>;
}
export declare const branchesService: BranchesService;
//# sourceMappingURL=branches.service.d.ts.map