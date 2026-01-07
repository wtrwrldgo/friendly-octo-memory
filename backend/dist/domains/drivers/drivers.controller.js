import { driversService } from './drivers.service.js';
import { ordersService } from '../orders/orders.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
export const driversController = {
    async list(req, res, next) {
        try {
            const { firmId, branchId } = req.query;
            const drivers = await driversService.list(firmId, branchId);
            sendSuccess(res, drivers);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const id = req.params.id;
            const driver = await driversService.getById(id);
            if (!driver) {
                res.status(404).json({ success: false, message: 'Driver not found' });
                return;
            }
            sendSuccess(res, driver);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            // Map city to district for database storage
            const data = {
                ...req.body,
                district: req.body.city || req.body.district,
            };
            const driver = await driversService.create(data);
            sendSuccess(res, driver, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const driver = await driversService.update(id, req.body);
            if (!driver) {
                res.status(404).json({ success: false, message: 'Driver not found' });
                return;
            }
            sendSuccess(res, driver);
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const id = req.params.id;
            const deleted = await driversService.delete(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Driver not found' });
                return;
            }
            sendSuccess(res, { message: 'Driver deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    },
    // Update driver online status
    async updateStatus(req, res, next) {
        try {
            const id = req.params.id;
            const { isOnline } = req.body;
            const driver = await driversService.update(id, { isAvailable: isOnline });
            if (!driver) {
                res.status(404).json({ success: false, message: 'Driver not found' });
                return;
            }
            sendSuccess(res, driver);
        }
        catch (error) {
            next(error);
        }
    },
    // Update driver location
    async updateLocation(req, res, next) {
        try {
            const id = req.params.id;
            const { lat, lng } = req.body;
            await driversService.updateLocation(id, lat, lng);
            sendSuccess(res, { message: 'Location updated' });
        }
        catch (error) {
            next(error);
        }
    },
    // Get available orders for a driver
    async getOrders(req, res, next) {
        try {
            const status = req.query.status;
            // Get available orders (PENDING status, no driver assigned)
            const orders = await ordersService.getAvailableOrders(status);
            sendSuccess(res, orders);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=drivers.controller.js.map