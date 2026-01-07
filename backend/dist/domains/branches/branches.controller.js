import { branchesService } from './branches.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
export class BranchesController {
    async list(req, res, next) {
        try {
            const query = req.query;
            const { branches, total } = await branchesService.list(query);
            sendPaginated(res, branches, query.page, query.limit, total);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const branch = await branchesService.getById(id);
            sendSuccess(res, branch);
        }
        catch (error) {
            next(error);
        }
    }
    async getByFirmId(req, res, next) {
        try {
            const { firmId } = req.params;
            const branches = await branchesService.getByFirmId(firmId);
            sendSuccess(res, branches);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const branch = await branchesService.create(req.body);
            sendSuccess(res, branch, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const branch = await branchesService.update(id, req.body);
            sendSuccess(res, branch);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await branchesService.delete(id);
            sendSuccess(res, { message: 'Branch deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
export const branchesController = new BranchesController();
//# sourceMappingURL=branches.controller.js.map