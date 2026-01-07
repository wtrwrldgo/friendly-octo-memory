import { sendSuccess } from '../../shared/utils/response.js';
export const uploadController = {
    async uploadFirmLogo(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            const imageUrl = `/static/uploads/firms/${req.file.filename}`;
            sendSuccess(res, { logoUrl: imageUrl, imageUrl });
        }
        catch (error) {
            next(error);
        }
    },
    async uploadHomeBanner(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            const imageUrl = `/static/uploads/firms/${req.file.filename}`;
            sendSuccess(res, { homeBannerUrl: imageUrl, imageUrl });
        }
        catch (error) {
            next(error);
        }
    },
    async uploadDetailBanner(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            const imageUrl = `/static/uploads/firms/${req.file.filename}`;
            sendSuccess(res, { detailBannerUrl: imageUrl, imageUrl });
        }
        catch (error) {
            next(error);
        }
    },
    async uploadProductImage(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            const imageUrl = `/static/uploads/products/${req.file.filename}`;
            sendSuccess(res, { imageUrl });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=upload.controller.js.map