import { authService } from './auth.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
class AuthController {
    async staffLogin(req, res, next) {
        try {
            const result = await authService.staffLogin(req.body);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async driverLogin(req, res, next) {
        try {
            const result = await authService.driverLogin(req.body);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async adminLogin(req, res, next) {
        try {
            const result = await authService.adminLogin(req.body);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
export const authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map