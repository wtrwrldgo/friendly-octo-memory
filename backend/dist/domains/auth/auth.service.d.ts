import type { StaffLoginInput } from './auth.schema.js';
interface StaffLoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        firmId: string | null;
        branchId: string | null;
    };
    firm: {
        id: string;
        name: string;
        logoUrl: string | null;
        city: string | null;
        status: string;
        isVisibleInClientApp: boolean;
        rejectionReason: string | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
    } | null;
}
declare class AuthService {
    staffLogin(input: StaffLoginInput): Promise<StaffLoginResponse>;
    driverLogin(input: {
        driverId: string;
        code: string;
    }): Promise<{
        token: string;
        driver: {
            id: string;
            firmId: string | null;
            driverNumber: number | null;
            vehicleNumber: string | null;
        };
        firm: {
            id: string;
            name: string | null;
        } | null;
    }>;
    adminLogin(input: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        admin: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map