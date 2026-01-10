import { prisma } from '../../infrastructure/database/prisma.js';
import { UserRole } from '@prisma/client';
export const clientsService = {
    /**
     * List clients with firm isolation.
     *
     * IMPORTANT: Clients are discovered through their orders.
     * A client only "exists" for a firm if they have placed at least one order with that firm.
     *
     * @param params.firmId - Required for firm staff. Only returns clients who ordered from this firm.
     * @param params.branchId - Optional. Further filter by branch.
     * @param params.includeGlobal - Only for WaterGo Super Admin. Returns ALL clients with cross-firm stats.
     */
    async list(params = {}) {
        const { firmId, branchId, includeGlobal } = params;
        console.log('[ClientsService.list] Called with params:', { firmId, branchId, includeGlobal });
        // CASE 1: Global view for WaterGo Super Admin
        if (includeGlobal && !firmId) {
            console.log('[ClientsService.list] -> listGlobalClients (includeGlobal=true, no firmId)');
            return this.listGlobalClients();
        }
        // CASE 2: Firm-isolated view (default)
        // firmId is required for firm staff - return only clients who ordered from this firm
        if (!firmId) {
            // No firmId and not global = return empty (security: don't expose all clients)
            console.log('[ClientsService.list] -> returning [] (no firmId, not global)');
            return [];
        }
        console.log('[ClientsService.list] -> listFirmClients for firmId:', firmId);
        return this.listFirmClients(firmId, branchId);
    },
    /**
     * List clients for a firm - only those who have placed orders with this firm.
     * A client only "exists" for a firm if they have placed at least one order.
     */
    async listFirmClients(firmId, branchId) {
        // Build order filter for firm and optionally branch
        const orderFilter = { firm_id: firmId };
        if (branchId) {
            orderFilter.branch_id = branchId;
        }
        // Get clients who have at least one order with this firm
        const clients = await prisma.users.findMany({
            where: {
                role: UserRole.CLIENT,
                // Only include clients with orders from this firm
                orders: {
                    some: orderFilter,
                },
            },
            include: {
                client_profiles: { select: { name: true, email: true } },
                addresses: {
                    take: 1, // Get primary address for display
                    orderBy: { created_at: 'desc' },
                },
                // Include orders from THIS firm only (for stats)
                orders: {
                    where: orderFilter,
                    orderBy: { created_at: 'desc' },
                    include: {
                        addresses: { select: { address: true } },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        // Transform to response format with firm-specific stats
        return clients.map((client) => {
            // Only count non-cancelled orders
            const activeOrders = client.orders.filter((o) => o.stage !== 'CANCELLED');
            const deliveredOrders = client.orders.filter((o) => o.stage === 'DELIVERED');
            const totalOrders = activeOrders.length;
            // Revenue only from delivered orders
            const revenue = deliveredOrders.reduce((sum, order) => sum + Number(order.total), 0);
            const lastOrder = activeOrders[0];
            const lastOrderAt = lastOrder ? lastOrder.created_at : null;
            // Get address from the most recent order's delivery address, fallback to user's saved address
            const address = lastOrder?.addresses?.address || client.addresses[0]?.address || null;
            console.log('[ClientsService] Client data:', {
                id: client.id,
                name: client.client_profiles?.name,
                ordersCount: client.orders.length,
                activeOrdersCount: activeOrders.length,
                deliveredCount: deliveredOrders.length,
                totalOrders,
                revenue,
                address,
                orderStages: client.orders.map((o) => o.stage),
            });
            return {
                id: client.id,
                name: client.client_profiles?.name || 'User',
                phone: client.phone,
                email: client.client_profiles?.email || null,
                role: client.role,
                language: client.language,
                createdAt: client.created_at,
                updatedAt: client.updated_at,
                // Firm-specific stats
                address,
                totalOrders,
                revenue,
                lastOrderAt,
                // Include recent orders for detailed view (firm-filtered)
                recentOrders: client.orders.slice(0, 10),
            };
        });
    },
    /**
     * List ALL clients with global statistics (WaterGo Super Admin only).
     * Shows cross-firm analytics: total orders/revenue across all firms.
     */
    async listGlobalClients() {
        const clients = await prisma.users.findMany({
            where: {
                role: UserRole.CLIENT,
            },
            include: {
                client_profiles: { select: { name: true, email: true } },
                addresses: {
                    take: 1,
                    orderBy: { created_at: 'desc' },
                },
                orders: {
                    select: {
                        id: true,
                        order_number: true,
                        total: true,
                        stage: true,
                        created_at: true,
                        firm_id: true,
                        firms: {
                            select: { name: true },
                        },
                    },
                    orderBy: { created_at: 'desc' },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        return clients.map((client) => {
            const totalOrders = client.orders.length;
            const revenue = client.orders.reduce((sum, order) => sum + Number(order.total), 0);
            const lastOrder = client.orders[0];
            const lastOrderAt = lastOrder ? lastOrder.created_at : null;
            const address = client.addresses[0]?.address || null;
            // Count unique firms this client has ordered from
            const uniqueFirmIds = new Set(client.orders.map((o) => o.firm_id));
            const firmsCount = uniqueFirmIds.size;
            return {
                id: client.id,
                name: client.client_profiles?.name || 'User',
                phone: client.phone,
                email: client.client_profiles?.email || null,
                role: client.role,
                language: client.language,
                createdAt: client.created_at,
                updatedAt: client.updated_at,
                // Global stats
                address,
                totalOrders,
                revenue,
                lastOrderAt,
                firmsCount, // Number of firms this client has ordered from
                recentOrders: client.orders.slice(0, 10),
            };
        });
    },
    /**
     * Get single client by ID with firm isolation.
     *
     * @param id - Client user ID
     * @param firmId - If provided, only return client if they have ordered from this firm,
     *                 and only show orders from this firm.
     */
    async getById(id, firmId) {
        // First check if user exists and is a client
        const client = await prisma.users.findUnique({
            where: { id, role: UserRole.CLIENT },
            include: {
                addresses: true,
                orders: {
                    where: firmId ? { firm_id: firmId } : undefined, // Firm isolation
                    include: {
                        order_items: {
                            include: {
                                products: {
                                    select: { name: true, image_url: true },
                                },
                            },
                        },
                        firms: { select: { id: true, name: true } },
                        branches: { select: { id: true, name: true } },
                    },
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!client) {
            return null;
        }
        // If firmId provided, verify client has orders with this firm
        if (firmId && client.orders.length === 0) {
            // Client exists but has no orders with this firm = not their client
            return null;
        }
        // Calculate firm-specific stats
        const totalOrders = client.orders.length;
        const revenue = client.orders.reduce((sum, order) => sum + Number(order.total), 0);
        const lastOrderAt = client.orders[0]?.created_at || null;
        return {
            ...client,
            totalOrders,
            revenue,
            lastOrderAt,
        };
    },
    /**
     * Delete a client.
     * Note: This affects the client globally, not per-firm.
     */
    async delete(id) {
        const client = await prisma.users.findUnique({
            where: { id, role: UserRole.CLIENT },
        });
        if (!client) {
            return null;
        }
        // Hard delete - users table has no is_active column for soft delete
        await prisma.users.delete({
            where: { id },
        });
        return { success: true };
    },
};
//# sourceMappingURL=clients.service.js.map