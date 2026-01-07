import { usersService } from './users.service.js';
export const usersController = {
    async getById(req, res, next) {
        try {
            const id = req.params.id;
            const user = await usersService.getById(id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const { name, email, language } = req.body;
            const user = await usersService.update(id, { name, email, language });
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=users.controller.js.map