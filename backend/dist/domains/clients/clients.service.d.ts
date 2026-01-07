interface ClientListParams {
    firmId?: string;
    branchId?: string;
    includeGlobal?: boolean;
}
export declare const clientsService: {
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
    list(params?: ClientListParams): Promise<{
        id: any;
        name: any;
        phone: any;
        email: any;
        role: any;
        language: any;
        createdAt: any;
        updatedAt: any;
        address: any;
        totalOrders: any;
        revenue: any;
        lastOrderAt: any;
        recentOrders: any;
    }[]>;
    /**
     * List clients for a firm - only those who have placed orders with this firm.
     * A client only "exists" for a firm if they have placed at least one order.
     */
    listFirmClients(firmId: string, branchId?: string): Promise<{
        id: any;
        name: any;
        phone: any;
        email: any;
        role: any;
        language: any;
        createdAt: any;
        updatedAt: any;
        address: any;
        totalOrders: any;
        revenue: any;
        lastOrderAt: any;
        recentOrders: any;
    }[]>;
    /**
     * List ALL clients with global statistics (WaterGo Super Admin only).
     * Shows cross-firm analytics: total orders/revenue across all firms.
     */
    listGlobalClients(): Promise<{
        id: any;
        name: any;
        phone: any;
        email: any;
        role: any;
        language: any;
        createdAt: any;
        updatedAt: any;
        address: any;
        totalOrders: any;
        revenue: any;
        lastOrderAt: any;
        firmsCount: number;
        recentOrders: any;
    }[]>;
    /**
     * Get single client by ID with firm isolation.
     *
     * @param id - Client user ID
     * @param firmId - If provided, only return client if they have ordered from this firm,
     *                 and only show orders from this firm.
     */
    getById(id: string, firmId?: string): Promise<{
        totalOrders: number;
        revenue: number;
        lastOrderAt: Date | null;
        addresses: {
            id: string;
            address: string;
            created_at: Date;
            user_id: string;
            title: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            is_default: boolean;
        }[];
        orders: ({
            branches: {
                id: string;
                name: string;
            } | null;
            firms: {
                id: string;
                name: string;
            };
            order_items: ({
                products: {
                    name: string;
                    image_url: string | null;
                };
            } & {
                id: string;
                price: number;
                product_name: string;
                quantity: number;
                product_id: string;
                order_id: string;
            })[];
        } & {
            total: number;
            id: string;
            created_at: Date;
            updated_at: Date;
            delivery_fee: number;
            firm_id: string;
            branch_id: string | null;
            user_id: string;
            order_number: string;
            driver_id: string | null;
            address_id: string;
            stage: import(".prisma/client").$Enums.OrderStage;
            payment_method: import(".prisma/client").$Enums.PaymentMethod;
            estimated_delivery: Date | null;
            delivered_at: Date | null;
            cancelled_at: Date | null;
            cancel_reason: string | null;
            notes: string | null;
        })[];
        id: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        created_at: Date;
        updated_at: Date;
        is_active: boolean;
        language: string;
    } | null>;
    /**
     * Delete a client.
     * Note: This affects the client globally, not per-firm.
     */
    delete(id: string): Promise<{
        success: boolean;
    } | null>;
};
export {};
//# sourceMappingURL=clients.service.d.ts.map