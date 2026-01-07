import type { branches } from '@prisma/client';
import type { CreateBranchInput, UpdateBranchInput, ListBranchesQuery } from './branches.schema.js';
export declare class BranchesRepository {
    findAll(query: ListBranchesQuery): Promise<{
        branches: branches[];
        total: number;
    }>;
    findById(id: string): Promise<branches | null>;
    findByFirmId(firmId: string): Promise<branches[]>;
    create(data: CreateBranchInput): Promise<branches>;
    update(id: string, data: UpdateBranchInput): Promise<branches>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<branches>;
    exists(id: string): Promise<boolean>;
    belongsToFirm(branchId: string, firmId: string): Promise<boolean>;
}
export declare const branchesRepository: BranchesRepository;
//# sourceMappingURL=branches.repository.d.ts.map