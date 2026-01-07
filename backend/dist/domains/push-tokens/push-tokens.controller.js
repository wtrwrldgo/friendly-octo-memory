import { pushTokensService } from './push-tokens.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
export const pushTokensController = {
    /**
     * Register a push token for the authenticated user
     * POST /api/push-tokens
     * Body: { token: string, platform: 'ios' | 'android' }
     */
    async register(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { token, platform } = req.body;
            if (!token || !platform) {
                res.status(400).json({
                    success: false,
                    message: 'token and platform are required',
                });
                return;
            }
            if (!['ios', 'android'].includes(platform)) {
                res.status(400).json({
                    success: false,
                    message: 'platform must be "ios" or "android"',
                });
                return;
            }
            await pushTokensService.register(userId, token, platform);
            console.log(`[PushTokens] Registered token for user ${userId} (${platform})`);
            sendSuccess(res, { registered: true });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Unregister a push token
     * DELETE /api/push-tokens
     * Body: { token: string }
     */
    async unregister(req, res, next) {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(400).json({
                    success: false,
                    message: 'token is required',
                });
                return;
            }
            await pushTokensService.unregister(token);
            console.log(`[PushTokens] Unregistered token: ${token.substring(0, 20)}...`);
            sendSuccess(res, { unregistered: true });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=push-tokens.controller.js.map