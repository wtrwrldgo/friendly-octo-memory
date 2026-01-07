import { Router } from 'express';
import { authMobileController } from './auth-mobile.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendCodeSchema, verifyCodeSchema, refreshTokenSchema, updateProfileSchema, } from './auth-mobile.schema.js';
const router = Router();
// Public routes (no auth required)
router.post('/send-code', validate({ body: sendCodeSchema }), authMobileController.sendCode.bind(authMobileController));
router.post('/verify-code', validate({ body: verifyCodeSchema }), authMobileController.verifyCode.bind(authMobileController));
router.post('/refresh', validate({ body: refreshTokenSchema }), authMobileController.refreshToken.bind(authMobileController));
router.post('/logout', validate({ body: refreshTokenSchema }), authMobileController.logout.bind(authMobileController));
// Protected routes (auth required)
router.get('/profile', authenticate, authMobileController.getProfile.bind(authMobileController));
router.put('/profile', authenticate, validate({ body: updateProfileSchema }), authMobileController.updateProfile.bind(authMobileController));
export { router as authMobileRoutes };
//# sourceMappingURL=auth-mobile.routes.js.map