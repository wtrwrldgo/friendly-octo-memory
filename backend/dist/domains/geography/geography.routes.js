import { Router } from 'express';
import { geographyController } from './geography.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { UserRole } from '@prisma/client';
import { createRegionSchema, updateRegionSchema, regionIdSchema, createCitySchema, updateCitySchema, cityIdSchema, listCitiesQuerySchema, } from './geography.schema.js';
import { z } from 'zod';
const router = Router();
// === Region Routes ===
// Public - List all regions
router.get('/regions', geographyController.listRegions.bind(geographyController));
// Public - Get region by ID (includes cities)
router.get('/regions/:id', validate({ params: regionIdSchema }), geographyController.getRegionById.bind(geographyController));
// Admin only - Create region
router.post('/regions', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ body: createRegionSchema }), geographyController.createRegion.bind(geographyController));
// Admin only - Update region
router.put('/regions/:id', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: regionIdSchema, body: updateRegionSchema }), geographyController.updateRegion.bind(geographyController));
// Admin only - Delete region
router.delete('/regions/:id', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: regionIdSchema }), geographyController.deleteRegion.bind(geographyController));
// === City Routes ===
// Public - List all cities (with optional region filter)
router.get('/cities', validate({ query: listCitiesQuerySchema }), geographyController.listCities.bind(geographyController));
// Public - Get city by ID
router.get('/cities/:id', validate({ params: cityIdSchema }), geographyController.getCityById.bind(geographyController));
// Public - Get cities by region
router.get('/regions/:regionId/cities', validate({ params: z.object({ regionId: z.string().uuid() }) }), geographyController.getCitiesByRegionId.bind(geographyController));
// Admin only - Create city
router.post('/cities', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ body: createCitySchema }), geographyController.createCity.bind(geographyController));
// Admin only - Update city
router.put('/cities/:id', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: cityIdSchema, body: updateCitySchema }), geographyController.updateCity.bind(geographyController));
// Admin only - Delete city
router.delete('/cities/:id', authenticate, requireRoles(UserRole.WATERGO_ADMIN), validate({ params: cityIdSchema }), geographyController.deleteCity.bind(geographyController));
export { router as geographyRoutes };
//# sourceMappingURL=geography.routes.js.map