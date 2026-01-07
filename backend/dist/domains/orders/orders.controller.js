import { ordersService } from './orders.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
export const ordersController = {
    async create(req, res, next) {
        try {
            const { userId, firmId, addressId, address, total, items, preferredDeliveryTime, notes, paymentMethod } = req.body;
            // Require userId, firmId, items, and either addressId or address string
            if (!userId || !firmId || !items || !Array.isArray(items)) {
                res.status(400).json({ success: false, message: 'Missing required fields: userId, firmId, items' });
                return;
            }
            if (!addressId && !address) {
                res.status(400).json({ success: false, message: 'Missing required field: addressId or address' });
                return;
            }
            // If address string is provided, create an address first
            let finalAddressId = addressId;
            if (!addressId && address) {
                const newAddress = await ordersService.createAddress({
                    userId,
                    address: address,
                    isDefault: false,
                });
                finalAddressId = newAddress.id;
            }
            const order = await ordersService.create({
                userId,
                firmId,
                addressId: finalAddressId,
                total: total || 0,
                items,
                preferredDeliveryTime,
                notes,
                paymentMethod,
            });
            sendSuccess(res, order, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getByUserId(req, res, next) {
        try {
            const userId = req.params.userId;
            const orders = await ordersService.getByUserId(userId);
            sendSuccess(res, orders);
        }
        catch (error) {
            next(error);
        }
    },
    async list(req, res, next) {
        try {
            const { firmId, branchId } = req.query;
            const orders = await ordersService.list(firmId, branchId);
            sendSuccess(res, orders);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const id = req.params.id;
            const order = await ordersService.getById(id);
            if (!order) {
                res.status(404).json({ success: false, message: 'Order not found' });
                return;
            }
            sendSuccess(res, order);
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const id = req.params.id;
            const { stage } = req.body;
            const order = await ordersService.updateStatus(id, stage);
            sendSuccess(res, order);
        }
        catch (error) {
            next(error);
        }
    },
    async getStatus(req, res, next) {
        try {
            const id = req.params.id;
            const order = await ordersService.getById(id);
            if (!order) {
                res.status(404).json({ success: false, message: 'Order not found' });
                return;
            }
            // Get queue position for pending orders
            const queueInfo = await ordersService.getQueuePosition(id);
            sendSuccess(res, {
                stage: order.stage,
                estimatedDelivery: order.estimated_delivery,
                queuePosition: queueInfo.queuePosition,
                ordersAhead: queueInfo.ordersAhead,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async cancelOrder(req, res, next) {
        try {
            const id = req.params.id;
            const { reason } = req.body;
            const order = await ordersService.cancel(id, reason);
            sendSuccess(res, { success: true, order });
        }
        catch (error) {
            next(error);
        }
    },
    async acceptOrder(req, res, next) {
        try {
            const id = req.params.id;
            const { driverId } = req.body;
            if (!driverId) {
                res.status(400).json({ success: false, message: 'Driver ID is required' });
                return;
            }
            const order = await ordersService.acceptOrder(id, driverId);
            sendSuccess(res, order);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=orders.controller.js.map