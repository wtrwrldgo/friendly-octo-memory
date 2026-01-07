import type { Request, Response, NextFunction } from 'express';
import { geographyService } from './geography.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
import type { CreateRegionInput, UpdateRegionInput, CreateCityInput, UpdateCityInput, ListCitiesQuery } from './geography.schema.js';

export class GeographyController {
  // Region endpoints
  async listRegions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const regions = await geographyService.listRegions(includeInactive);
      sendSuccess(res, regions);
    } catch (error) {
      next(error);
    }
  }

  async getRegionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const region = await geographyService.getRegionById(id);
      sendSuccess(res, region);
    } catch (error) {
      next(error);
    }
  }

  async createRegion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const region = await geographyService.createRegion(req.body as CreateRegionInput);
      sendSuccess(res, region, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateRegion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const region = await geographyService.updateRegion(id, req.body as UpdateRegionInput);
      sendSuccess(res, region);
    } catch (error) {
      next(error);
    }
  }

  async deleteRegion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      await geographyService.deleteRegion(id);
      sendSuccess(res, { message: 'Region deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // City endpoints
  async listCities(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as ListCitiesQuery;
      const cities = await geographyService.listCities(query);
      sendSuccess(res, cities);
    } catch (error) {
      next(error);
    }
  }

  async getCityById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const city = await geographyService.getCityById(id);
      sendSuccess(res, city);
    } catch (error) {
      next(error);
    }
  }

  async getCitiesByRegionId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { regionId } = req.params as { regionId: string };
      const cities = await geographyService.getCitiesByRegionId(regionId);
      sendSuccess(res, cities);
    } catch (error) {
      next(error);
    }
  }

  async createCity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const city = await geographyService.createCity(req.body as CreateCityInput);
      sendSuccess(res, city, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const city = await geographyService.updateCity(id, req.body as UpdateCityInput);
      sendSuccess(res, city);
    } catch (error) {
      next(error);
    }
  }

  async deleteCity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      await geographyService.deleteCity(id);
      sendSuccess(res, { message: 'City deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const geographyController = new GeographyController();
