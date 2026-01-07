import type { regions, cities } from '@prisma/client';
import type { CreateRegionInput, UpdateRegionInput, CreateCityInput, UpdateCityInput, ListCitiesQuery } from './geography.schema.js';
export declare class GeographyRepository {
    findAllRegions(includeInactive?: boolean): Promise<regions[]>;
    findRegionById(id: string): Promise<regions | null>;
    findRegionByCode(code: string): Promise<regions | null>;
    createRegion(data: CreateRegionInput): Promise<regions>;
    updateRegion(id: string, data: UpdateRegionInput): Promise<regions>;
    deleteRegion(id: string): Promise<void>;
    regionExists(id: string): Promise<boolean>;
    findAllCities(query: ListCitiesQuery): Promise<cities[]>;
    findCityById(id: string): Promise<cities | null>;
    findCitiesByRegionId(regionId: string): Promise<cities[]>;
    createCity(data: CreateCityInput): Promise<cities>;
    updateCity(id: string, data: UpdateCityInput): Promise<cities>;
    deleteCity(id: string): Promise<void>;
    cityExists(id: string): Promise<boolean>;
}
export declare const geographyRepository: GeographyRepository;
//# sourceMappingURL=geography.repository.d.ts.map