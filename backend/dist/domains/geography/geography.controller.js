import { geographyService } from './geography.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
export class GeographyController {
    // Region endpoints
    async listRegions(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const regions = await geographyService.listRegions(includeInactive);
            sendSuccess(res, regions);
        }
        catch (error) {
            next(error);
        }
    }
    async getRegionById(req, res, next) {
        try {
            const { id } = req.params;
            const region = await geographyService.getRegionById(id);
            sendSuccess(res, region);
        }
        catch (error) {
            next(error);
        }
    }
    async createRegion(req, res, next) {
        try {
            const region = await geographyService.createRegion(req.body);
            sendSuccess(res, region, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateRegion(req, res, next) {
        try {
            const { id } = req.params;
            const region = await geographyService.updateRegion(id, req.body);
            sendSuccess(res, region);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteRegion(req, res, next) {
        try {
            const { id } = req.params;
            await geographyService.deleteRegion(id);
            sendSuccess(res, { message: 'Region deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // City endpoints
    async listCities(req, res, next) {
        try {
            const query = req.query;
            const cities = await geographyService.listCities(query);
            sendSuccess(res, cities);
        }
        catch (error) {
            next(error);
        }
    }
    async getCityById(req, res, next) {
        try {
            const { id } = req.params;
            const city = await geographyService.getCityById(id);
            sendSuccess(res, city);
        }
        catch (error) {
            next(error);
        }
    }
    async getCitiesByRegionId(req, res, next) {
        try {
            const { regionId } = req.params;
            const cities = await geographyService.getCitiesByRegionId(regionId);
            sendSuccess(res, cities);
        }
        catch (error) {
            next(error);
        }
    }
    async createCity(req, res, next) {
        try {
            const city = await geographyService.createCity(req.body);
            sendSuccess(res, city, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateCity(req, res, next) {
        try {
            const { id } = req.params;
            const city = await geographyService.updateCity(id, req.body);
            sendSuccess(res, city);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCity(req, res, next) {
        try {
            const { id } = req.params;
            await geographyService.deleteCity(id);
            sendSuccess(res, { message: 'City deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
export const geographyController = new GeographyController();
//# sourceMappingURL=geography.controller.js.map