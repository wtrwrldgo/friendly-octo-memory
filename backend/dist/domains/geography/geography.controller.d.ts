import type { Request, Response, NextFunction } from 'express';
export declare class GeographyController {
    listRegions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRegionById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createRegion(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateRegion(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteRegion(req: Request, res: Response, next: NextFunction): Promise<void>;
    listCities(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCityById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCitiesByRegionId(req: Request, res: Response, next: NextFunction): Promise<void>;
    createCity(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCity(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCity(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const geographyController: GeographyController;
//# sourceMappingURL=geography.controller.d.ts.map