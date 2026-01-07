import { GeographyRepository } from './geography.repository.js';
import type { regions, cities } from '@prisma/client';
import type { CreateRegionInput, UpdateRegionInput, CreateCityInput, UpdateCityInput, ListCitiesQuery } from './geography.schema.js';
export declare class GeographyService {
    private repository;
    constructor(repository?: GeographyRepository);
    listRegions(includeInactive?: boolean): Promise<regions[]>;
    getRegionById(id: string): Promise<regions>;
    createRegion(data: CreateRegionInput): Promise<regions>;
    updateRegion(id: string, data: UpdateRegionInput): Promise<regions>;
    deleteRegion(id: string): Promise<void>;
    listCities(query: ListCitiesQuery): Promise<cities[]>;
    getCityById(id: string): Promise<cities>;
    getCitiesByRegionId(regionId: string): Promise<cities[]>;
    createCity(data: CreateCityInput): Promise<cities>;
    updateCity(id: string, data: UpdateCityInput): Promise<cities>;
    deleteCity(id: string): Promise<void>;
    private invalidateRegionsCache;
}
export declare const geographyService: GeographyService;
//# sourceMappingURL=geography.service.d.ts.map