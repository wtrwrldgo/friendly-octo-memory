export declare const addressesService: {
    list(userId: string): Promise<{
        id: string;
        address: string;
        created_at: Date;
        user_id: string;
        title: string;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        is_default: boolean;
    }[]>;
    create(userId: string, data: {
        title: string;
        address: string;
        latitude: number;
        longitude: number;
        isDefault?: boolean;
    }): Promise<{
        id: string;
        address: string;
        created_at: Date;
        user_id: string;
        title: string;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        is_default: boolean;
    }>;
    update(id: string, userId: string, data: {
        title?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        isDefault?: boolean;
    }): Promise<{
        id: string;
        address: string;
        created_at: Date;
        user_id: string;
        title: string;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        is_default: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        address: string;
        created_at: Date;
        user_id: string;
        title: string;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        is_default: boolean;
    }>;
    getById(id: string, userId: string): Promise<{
        id: string;
        address: string;
        created_at: Date;
        user_id: string;
        title: string;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        is_default: boolean;
    } | null>;
};
//# sourceMappingURL=addresses.service.d.ts.map