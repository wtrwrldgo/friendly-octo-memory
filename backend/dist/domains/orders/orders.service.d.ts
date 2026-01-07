interface CreateOrderInput {
    userId: string;
    firmId: string;
    addressId: string;
    total: number;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    preferredDeliveryTime?: string | null;
    notes?: string;
    paymentMethod?: 'CASH' | 'CARD';
}
interface CreateAddressInput {
    userId: string;
    address: string;
    title?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
}
export declare const ordersService: {
    createAddress(data: CreateAddressInput): Promise<{
        id: string;
        address: string;
        created_at: Date;
        user_id: string;
        title: string;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        is_default: boolean;
    }>;
    create(data: CreateOrderInput): Promise<{
        items: ({
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
        user: {
            id: string;
            phone: string;
            name: string;
        };
        addresses: {
            id: string;
            address: string;
            created_at: Date;
            user_id: string;
            title: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            is_default: boolean;
        };
        firms: {
            id: string;
            name: string;
        };
        users: {
            id: string;
            phone: string;
            client_profiles: {
                name: string;
            } | null;
        };
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
    }>;
    getByUserId(userId: string): Promise<{
        items: ({
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
        addresses: {
            id: string;
            address: string;
            created_at: Date;
            user_id: string;
            title: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            is_default: boolean;
        };
        drivers: {
            id: string;
            phone: string | null;
            name: string | null;
            rating: import("@prisma/client/runtime/library").Decimal;
            vehicle_number: string | null;
            car_brand: string | null;
            car_color: string | null;
            driver_number: string | null;
        } | null;
        firms: {
            id: string;
            name: string;
        };
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
    }[]>;
    list(firmId?: string, branchId?: string): Promise<{
        items: ({
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
        user: {
            id: string;
            phone: string;
            name: string;
        };
        addresses: {
            id: string;
            address: string;
            created_at: Date;
            user_id: string;
            title: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            is_default: boolean;
        };
        branches: {
            id: string;
            name: string;
        } | null;
        drivers: {
            id: string;
            phone: string | null;
            name: string | null;
            rating: import("@prisma/client/runtime/library").Decimal;
            vehicle_number: string | null;
            car_brand: string | null;
            car_color: string | null;
            driver_number: string | null;
        } | null;
        firms: {
            id: string;
            name: string;
        };
        users: {
            id: string;
            phone: string;
            client_profiles: {
                name: string;
            } | null;
        };
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
    }[]>;
    getById(id: string): Promise<{
        items: ({
            products: {
                id: string;
                name: string;
                description: string | null;
                created_at: Date;
                updated_at: Date;
                firm_id: string;
                in_stock: boolean;
                name_en: string | null;
                name_ru: string | null;
                name_uz: string | null;
                name_kaa: string | null;
                price: number;
                image_url: string | null;
                volume: string | null;
            };
        } & {
            id: string;
            price: number;
            product_name: string;
            quantity: number;
            product_id: string;
            order_id: string;
        })[];
        user: {
            id: string;
            phone: string;
            name: string;
        };
        addresses: {
            id: string;
            address: string;
            created_at: Date;
            user_id: string;
            title: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            is_default: boolean;
        };
        branches: {
            id: string;
            name: string;
        } | null;
        drivers: {
            id: string;
            phone: string | null;
            name: string | null;
            rating: import("@prisma/client/runtime/library").Decimal;
            vehicle_number: string | null;
            car_brand: string | null;
            car_color: string | null;
            driver_number: string | null;
        } | null;
        firms: {
            id: string;
            name: string;
        };
        users: {
            id: string;
            phone: string;
            client_profiles: {
                name: string;
            } | null;
        };
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
    } | null>;
    updateStatus(id: string, stage: string): Promise<{
        users: {
            id: string;
        };
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
    }>;
    cancel(id: string, reason?: string): Promise<{
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
    }>;
    acceptOrder(orderId: string, driverId: string): Promise<{
        items: ({
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
        user: {
            id: string;
            phone: string;
            name: string;
        };
        addresses: {
            id: string;
            address: string;
            created_at: Date;
            user_id: string;
            title: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            is_default: boolean;
        };
        firms: {
            id: string;
            name: string;
        };
        users: {
            id: string;
            phone: string;
            client_profiles: {
                name: string;
            } | null;
        };
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
    }>;
    getQueuePosition(orderId: string): Promise<{
        queuePosition: number;
        ordersAhead: number;
    }>;
    getAvailableOrders(status?: string): Promise<{
        items: ({
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
        user: {
            id: string;
            phone: string;
            name: string;
        };
        addresses: {
            id: string;
            address: string;
            created_at: Date;
            user_id: string;
            title: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            is_default: boolean;
        };
        firms: {
            id: string;
            name: string;
        };
        users: {
            id: string;
            phone: string;
            client_profiles: {
                name: string;
            } | null;
        };
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
    }[]>;
};
export {};
//# sourceMappingURL=orders.service.d.ts.map