import type { StaffRole } from '@prisma/client';
export declare const staffService: {
    list(firmId?: string, branchId?: string): Promise<{
        id: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.StaffRole;
        branches: {
            id: string;
            name: string;
        } | null;
        firms: {
            id: string;
            name: string;
        } | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        is_active: boolean;
        firm_id: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        branch_id: string | null;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.StaffRole;
        branches: {
            id: string;
            name: string;
        } | null;
        firms: {
            id: string;
            name: string;
        } | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        is_active: boolean;
        firm_id: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        branch_id: string | null;
    } | null>;
    create(data: {
        firmId: string;
        branchId?: string;
        name: string;
        phone: string;
        email: string;
        password: string;
        role?: StaffRole;
        permissions?: string[];
    }): Promise<{
        id: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.StaffRole;
        name: string;
        created_at: Date;
        updated_at: Date;
        is_active: boolean;
        firm_id: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        branch_id: string | null;
    }>;
    update(id: string, data: {
        name?: string;
        phone?: string;
        email?: string;
        password?: string;
        role?: StaffRole;
        permissions?: string[];
        isActive?: boolean;
        branchId?: string | null;
    }): Promise<{
        id: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.StaffRole;
        name: string;
        created_at: Date;
        updated_at: Date;
        is_active: boolean;
        firm_id: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        branch_id: string | null;
    } | null>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=staff.service.d.ts.map