import { staffService } from './staff.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
export const staffController = {
    async list(req, res, next) {
        try {
            const { firmId, branchId } = req.query;
            const staff = await staffService.list(firmId, branchId);
            sendSuccess(res, staff);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const id = req.params.id;
            const staff = await staffService.getById(id);
            if (!staff) {
                res.status(404).json({ success: false, message: 'Staff not found' });
                return;
            }
            sendSuccess(res, staff);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const { firmId, branchId, name, phone, email, password, role, permissions } = req.body;
            if (!firmId || !name || !phone || !email || !password) {
                res.status(400).json({ success: false, message: 'Missing required fields: firmId, name, phone, email, password' });
                return;
            }
            const staff = await staffService.create({
                firmId,
                branchId,
                name,
                phone,
                email,
                password,
                role,
                permissions,
            });
            sendSuccess(res, staff, 201);
        }
        catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                res.status(409).json({ success: false, message: 'Email already exists' });
                return;
            }
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const staff = await staffService.update(id, req.body);
            if (!staff) {
                res.status(404).json({ success: false, message: 'Staff not found' });
                return;
            }
            sendSuccess(res, staff);
        }
        catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                res.status(409).json({ success: false, message: 'Email already exists' });
                return;
            }
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const id = req.params.id;
            const deleted = await staffService.delete(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Staff not found' });
                return;
            }
            sendSuccess(res, { message: 'Staff deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=staff.controller.js.map