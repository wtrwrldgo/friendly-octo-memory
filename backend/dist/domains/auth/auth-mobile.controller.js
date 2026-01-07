import { authMobileService } from './auth-mobile.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
class AuthMobileController {
    async sendCode(req, res, next) {
        try {
            const result = await authMobileService.sendCode(req.body);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyCode(req, res, next) {
        try {
            const result = await authMobileService.verifyCode(req.body);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const result = await authMobileService.refreshToken(req.body);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            await authMobileService.logout(req.body.refreshToken);
            sendSuccess(res, { message: 'Logged out successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const result = await authMobileService.getProfile(userId);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const result = await authMobileService.updateProfile(userId, req.body);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
export const authMobileController = new AuthMobileController();
//# sourceMappingURL=auth-mobile.controller.js.map