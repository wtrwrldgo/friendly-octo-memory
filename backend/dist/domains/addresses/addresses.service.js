import { prisma } from '../../infrastructure/database/prisma.js';
export const addressesService = {
    async list(userId) {
        return prisma.addresses.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
    },
    async create(userId, data) {
        // If this is the first address or marked as default, unset other defaults
        if (data.isDefault) {
            await prisma.addresses.updateMany({
                where: { user_id: userId, is_default: true },
                data: { is_default: false },
            });
        }
        return prisma.addresses.create({
            data: {
                user_id: userId,
                title: data.title,
                address: data.address,
                latitude: data.latitude,
                longitude: data.longitude,
                is_default: data.isDefault ?? false,
            },
        });
    },
    async update(id, userId, data) {
        // If setting as default, unset other defaults first
        if (data.isDefault) {
            await prisma.addresses.updateMany({
                where: { user_id: userId, is_default: true, id: { not: id } },
                data: { is_default: false },
            });
        }
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.latitude !== undefined)
            updateData.latitude = data.latitude;
        if (data.longitude !== undefined)
            updateData.longitude = data.longitude;
        if (data.isDefault !== undefined)
            updateData.is_default = data.isDefault;
        return prisma.addresses.update({
            where: { id },
            data: updateData,
        });
    },
    async delete(id, userId) {
        // First verify the address belongs to this user
        const address = await prisma.addresses.findFirst({
            where: { id, user_id: userId },
        });
        if (!address) {
            throw new Error('Address not found or does not belong to user');
        }
        return prisma.addresses.delete({
            where: { id },
        });
    },
    async getById(id, userId) {
        return prisma.addresses.findFirst({
            where: { id, user_id: userId },
        });
    },
};
//# sourceMappingURL=addresses.service.js.map