import { prisma } from '../../infrastructure/database/prisma.js';
export const driversService = {
    async list(firmId, branchId) {
        const where = {};
        if (firmId)
            where.firm_id = firmId;
        if (branchId)
            where.branch_id = branchId;
        const drivers = await prisma.drivers.findMany({
            where,
            include: {
                users: { select: { id: true, phone: true } },
                firms: { select: { id: true, name: true } },
                branches: { select: { id: true, name: true } },
            },
            orderBy: { created_at: 'desc' },
        });
        // Driver name is stored in Driver model, not User
        return drivers;
    },
    async getById(id) {
        // First try to find by driver ID
        let driver = await prisma.drivers.findUnique({
            where: { id },
            include: {
                users: true,
                firms: { select: { id: true, name: true, logo_url: true } },
                branches: { select: { id: true, name: true } },
            },
        });
        // If not found, try to find by userId (for mobile app auth flow)
        if (!driver) {
            driver = await prisma.drivers.findFirst({
                where: { user_id: id },
                include: {
                    users: true,
                    firms: { select: { id: true, name: true, logo_url: true } },
                    branches: { select: { id: true, name: true } },
                },
            });
        }
        return driver;
    },
    async create(data) {
        // Check if user with this phone already exists
        let user = await prisma.users.findUnique({
            where: { phone: data.phone },
        });
        if (user) {
            // Check if already a driver
            const existingDriver = await prisma.drivers.findUnique({
                where: { user_id: user.id },
            });
            if (existingDriver) {
                throw new Error('This phone number is already registered as a driver');
            }
            // Update user role to DRIVER (keep their existing clientProfile if any)
            user = await prisma.users.update({
                where: { id: user.id },
                data: {
                    role: 'DRIVER',
                    is_active: true,
                },
            });
        }
        else {
            // Create new user with DRIVER role
            user = await prisma.users.create({
                data: {
                    phone: data.phone,
                    role: 'DRIVER',
                },
            });
        }
        // Create driver linked to user (driver name stored in Driver model)
        const driver = await prisma.drivers.create({
            data: {
                user_id: user.id,
                firm_id: data.firmId,
                branch_id: data.branchId,
                name: data.name, // Store name in Driver model
                phone: data.phone, // Store work phone in Driver model
                driver_number: data.driverNumber,
                vehicle_number: data.vehicleNumber,
                car_brand: data.carBrand,
                car_color: data.carColor,
                district: data.district,
            },
            include: {
                users: { select: { id: true, phone: true } },
                firms: { select: { id: true, name: true } },
            },
        });
        return driver;
    },
    async update(id, data) {
        // Find driver (by driver ID or user ID)
        const existing = await this.getById(id);
        if (!existing)
            return null;
        const driverId = existing.id;
        // If phone is being updated, also update the linked user's phone
        // This is required for the auth system to find the user by phone
        if (data.phone && existing.user_id && data.phone !== existing.users?.phone) {
            await prisma.users.update({
                where: { id: existing.user_id },
                data: { phone: data.phone },
            });
        }
        // Update driver fields (name and phone are now stored in Driver model)
        const updated = await prisma.drivers.update({
            where: { id: driverId },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.vehicleNumber !== undefined && { vehicle_number: data.vehicleNumber }),
                ...(data.carBrand !== undefined && { car_brand: data.carBrand }),
                ...(data.carColor !== undefined && { car_color: data.carColor }),
                ...(data.district !== undefined && { district: data.district }),
                ...(data.isAvailable !== undefined && { is_available: data.isAvailable }),
            },
            include: {
                users: { select: { id: true, phone: true } },
                firms: { select: { id: true, name: true } },
            },
        });
        return updated;
    },
    async delete(id) {
        const existing = await this.getById(id);
        if (!existing)
            return false;
        // Delete driver record
        await prisma.drivers.delete({ where: { id: existing.id } });
        // Mark user as inactive (if linked to a user)
        if (existing.user_id) {
            await prisma.users.update({
                where: { id: existing.user_id },
                data: { is_active: false },
            });
        }
        return true;
    },
    async updateLocation(id, lat, lng) {
        // Find driver by ID or userId
        const existing = await this.getById(id);
        if (!existing)
            return;
        await prisma.drivers.update({
            where: { id: existing.id },
            data: {
                current_lat: lat,
                current_lng: lng,
            },
        });
    },
};
//# sourceMappingURL=drivers.service.js.map