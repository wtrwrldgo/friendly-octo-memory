export declare const driversService: {
    list(firmId?: string, branchId?: string): Promise<({
        branches: {
            id: string;
            name: string;
        } | null;
        firms: {
            id: string;
            name: string;
        } | null;
        users: {
            id: string;
            phone: string;
        } | null;
    } & {
        id: string;
        phone: string | null;
        name: string | null;
        rating: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        updated_at: Date;
        firm_id: string | null;
        branch_id: string | null;
        user_id: string | null;
        vehicle_number: string | null;
        car_brand: string | null;
        car_color: string | null;
        district: string | null;
        is_available: boolean;
        current_lat: import("@prisma/client/runtime/library").Decimal | null;
        current_lng: import("@prisma/client/runtime/library").Decimal | null;
        driver_number: string | null;
    })[]>;
    getById(id: string): Promise<({
        branches: {
            id: string;
            name: string;
        } | null;
        firms: {
            id: string;
            name: string;
            logo_url: string | null;
        } | null;
        users: {
            id: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            created_at: Date;
            updated_at: Date;
            is_active: boolean;
            language: string;
        } | null;
    } & {
        id: string;
        phone: string | null;
        name: string | null;
        rating: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        updated_at: Date;
        firm_id: string | null;
        branch_id: string | null;
        user_id: string | null;
        vehicle_number: string | null;
        car_brand: string | null;
        car_color: string | null;
        district: string | null;
        is_available: boolean;
        current_lat: import("@prisma/client/runtime/library").Decimal | null;
        current_lng: import("@prisma/client/runtime/library").Decimal | null;
        driver_number: string | null;
    }) | null>;
    create(data: {
        firmId: string;
        name: string;
        phone: string;
        branchId?: string;
        driverNumber: string;
        vehicleNumber?: string;
        carBrand?: string;
        carColor?: string;
        district?: string;
    }): Promise<{
        firms: {
            id: string;
            name: string;
        } | null;
        users: {
            id: string;
            phone: string;
        } | null;
    } & {
        id: string;
        phone: string | null;
        name: string | null;
        rating: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        updated_at: Date;
        firm_id: string | null;
        branch_id: string | null;
        user_id: string | null;
        vehicle_number: string | null;
        car_brand: string | null;
        car_color: string | null;
        district: string | null;
        is_available: boolean;
        current_lat: import("@prisma/client/runtime/library").Decimal | null;
        current_lng: import("@prisma/client/runtime/library").Decimal | null;
        driver_number: string | null;
    }>;
    update(id: string, data: {
        name?: string;
        phone?: string;
        vehicleNumber?: string;
        carBrand?: string;
        carColor?: string;
        isAvailable?: boolean;
        district?: string;
    }): Promise<({
        firms: {
            id: string;
            name: string;
        } | null;
        users: {
            id: string;
            phone: string;
        } | null;
    } & {
        id: string;
        phone: string | null;
        name: string | null;
        rating: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        updated_at: Date;
        firm_id: string | null;
        branch_id: string | null;
        user_id: string | null;
        vehicle_number: string | null;
        car_brand: string | null;
        car_color: string | null;
        district: string | null;
        is_available: boolean;
        current_lat: import("@prisma/client/runtime/library").Decimal | null;
        current_lng: import("@prisma/client/runtime/library").Decimal | null;
        driver_number: string | null;
    }) | null>;
    delete(id: string): Promise<boolean>;
    updateLocation(id: string, lat: number, lng: number): Promise<void>;
};
//# sourceMappingURL=drivers.service.d.ts.map