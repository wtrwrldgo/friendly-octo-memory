export declare const productsService: {
    list(firmId?: string, language?: string): Promise<{
        id: any;
        firmId: any;
        name: string;
        description: any;
        price: any;
        volume: any;
        image: any;
        imageUrl: any;
        inStock: any;
        createdAt: any;
        updatedAt: any;
        name_en: any;
        name_ru: any;
        name_uz: any;
        name_kaa: any;
        firm: any;
    }[]>;
    getById(id: string, language?: string): Promise<{
        id: any;
        firmId: any;
        name: string;
        description: any;
        price: any;
        volume: any;
        image: any;
        imageUrl: any;
        inStock: any;
        createdAt: any;
        updatedAt: any;
        name_en: any;
        name_ru: any;
        name_uz: any;
        name_kaa: any;
        firm: any;
    } | null>;
    create(data: {
        firmId: string;
        name: string;
        name_en?: string;
        name_ru?: string;
        name_uz?: string;
        name_kaa?: string;
        description?: string;
        price: number;
        imageUrl?: string;
        volume?: string;
        inStock?: boolean;
    }): Promise<{
        firms: {
            id: string;
            name: string;
        };
    } & {
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
    }>;
    update(id: string, data: {
        name?: string;
        name_en?: string;
        name_ru?: string;
        name_uz?: string;
        name_kaa?: string;
        description?: string;
        price?: number;
        imageUrl?: string;
        volume?: string;
        inStock?: boolean;
    }, firmId?: string): Promise<{
        firms: {
            id: string;
            name: string;
        };
    } & {
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
    }>;
    delete(id: string, firmId?: string): Promise<boolean>;
};
//# sourceMappingURL=products.service.d.ts.map