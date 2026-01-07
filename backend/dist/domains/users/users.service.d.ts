interface UpdateUserInput {
    name?: string;
    email?: string;
    language?: string;
}
export declare const usersService: {
    getById(id: string): Promise<{
        id: string;
        phone: string;
        name: string | null;
        email: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        language: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, data: UpdateUserInput): Promise<{
        id: string;
        phone: string;
        name: string | null;
        email: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        language: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
};
export {};
//# sourceMappingURL=users.service.d.ts.map