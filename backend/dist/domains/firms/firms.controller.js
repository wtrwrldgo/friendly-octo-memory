import { firmsService } from './firms.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
export class FirmsController {
    // Public endpoint for client app - only returns visible firms
    async listPublic(_req, res, next) {
        try {
            const firms = await firmsService.listPublic();
            sendSuccess(res, firms);
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const query = req.query;
            const { firms, total } = await firmsService.list(query);
            sendPaginated(res, firms, query.page, query.limit, total);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const firm = await firmsService.getById(id);
            sendSuccess(res, firm);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const result = await firmsService.create(req.body);
            // Return firm and owner (without passwordHash)
            const responseData = { ...result.firm };
            if (result.owner) {
                const { passwordHash, ...ownerWithoutPassword } = result.owner;
                responseData.owner = ownerWithoutPassword;
            }
            sendSuccess(res, responseData, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const user = req.user;
            // Pass user firmId for ownership verification
            // WATERGO_ADMIN can update any firm, others can only update their own
            const firmId = user?.role === 'WATERGO_ADMIN' ? undefined : user?.firmId;
            const firm = await firmsService.update(id, req.body, firmId);
            sendSuccess(res, firm);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await firmsService.delete(id);
            sendSuccess(res, { message: 'Firm deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    async submitForReview(req, res, next) {
        try {
            const { id } = req.params;
            const user = req.user;
            const firm = await firmsService.submitForReview(id, user.firmId);
            sendSuccess(res, firm);
        }
        catch (error) {
            next(error);
        }
    }
    async approve(req, res, next) {
        try {
            const { id } = req.params;
            const firm = await firmsService.approve(id);
            sendSuccess(res, firm);
        }
        catch (error) {
            next(error);
        }
    }
    async reject(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            if (!reason) {
                res.status(400).json({ success: false, message: 'Rejection reason is required' });
                return;
            }
            const firm = await firmsService.reject(id, reason);
            sendSuccess(res, firm);
        }
        catch (error) {
            next(error);
        }
    }
    async reactivate(req, res, next) {
        try {
            const { id } = req.params;
            const firm = await firmsService.reactivate(id);
            sendSuccess(res, firm);
        }
        catch (error) {
            next(error);
        }
    }
    async suspend(req, res, next) {
        try {
            const { id } = req.params;
            const firm = await firmsService.suspend(id);
            sendSuccess(res, firm);
        }
        catch (error) {
            next(error);
        }
    }
}
export const firmsController = new FirmsController();
//# sourceMappingURL=firms.controller.js.map