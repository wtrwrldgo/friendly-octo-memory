import type { firms } from '@prisma/client';
import type { CreateFirmInput, UpdateFirmInput, ListFirmsQuery } from './firms.schema.js';
export declare class FirmsRepository {
    findAll(query: ListFirmsQuery): Promise<{
        firms: any[];
        total: number;
    }>;
    findById(id: string): Promise<any | null>;
    findByIdSimple(id: string): Promise<firms | null>;
    create(data: CreateFirmInput): Promise<{
        firm: any;
        owner?: any;
    }>;
    update(id: string, data: UpdateFirmInput): Promise<any>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<any>;
    exists(id: string): Promise<boolean>;
    findAllPublic(): Promise<any[]>;
}
export declare const firmsRepository: FirmsRepository;
//# sourceMappingURL=firms.repository.d.ts.map