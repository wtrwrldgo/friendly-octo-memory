import { prisma } from '../../infrastructure/database/prisma.js';

// Helper function to get translated name based on language
function getTranslatedName(product: any, language: string): string {
  const langMap: Record<string, string> = {
    en: product.name_en,
    ru: product.name_ru,
    uz: product.name_uz,
    kaa: product.name_kaa,
  };
  // Return translated name if available, otherwise fallback to default name
  return langMap[language] || product.name;
}

// Helper to transform product with translated name and camelCase fields
function transformProduct(product: any, language: string) {
  return {
    id: product.id,
    firmId: product.firm_id,
    name: getTranslatedName(product, language),
    description: product.description,
    price: product.price,
    volume: product.volume,
    image: product.image_url,
    imageUrl: product.image_url,
    inStock: product.in_stock,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    // Include all translation fields for client-side fallback
    name_en: product.name_en,
    name_ru: product.name_ru,
    name_uz: product.name_uz,
    name_kaa: product.name_kaa,
    // Include firm if available
    firm: product.firms,
  };
}

export const productsService = {
  async list(firmId?: string, language: string = 'uz') {
    const where: any = {};
    if (firmId) where.firm_id = firmId;

    const products = await prisma.products.findMany({
      where,
      include: {
        firms: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return products.map(p => transformProduct(p, language));
  },

  async getById(id: string, language: string = 'uz') {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        firms: { select: { id: true, name: true } },
      },
    });

    if (!product) return null;
    return transformProduct(product, language);
  },

  async create(data: {
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
  }) {
    const product = await prisma.products.create({
      data: {
        firm_id: data.firmId,
        name: data.name,
        name_en: data.name_en,
        name_ru: data.name_ru,
        name_uz: data.name_uz,
        name_kaa: data.name_kaa,
        description: data.description,
        price: data.price,
        image_url: data.imageUrl,
        volume: data.volume,
        in_stock: data.inStock ?? true,
      },
      include: {
        firms: { select: { id: true, name: true } },
      },
    });

    return product;
  },

  async update(id: string, data: {
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
  }, firmId?: string) {
    // If firmId is provided, verify ownership
    if (firmId) {
      const existing = await prisma.products.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('Product not found');
      }
      if (existing.firm_id !== firmId) {
        throw new Error('Forbidden: You can only update your own products');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.name_en !== undefined) updateData.name_en = data.name_en;
    if (data.name_ru !== undefined) updateData.name_ru = data.name_ru;
    if (data.name_uz !== undefined) updateData.name_uz = data.name_uz;
    if (data.name_kaa !== undefined) updateData.name_kaa = data.name_kaa;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.volume !== undefined) updateData.volume = data.volume;
    if (data.inStock !== undefined) updateData.in_stock = data.inStock;

    const product = await prisma.products.update({
      where: { id },
      data: updateData,
      include: {
        firms: { select: { id: true, name: true } },
      },
    });

    return product;
  },

  async delete(id: string, firmId?: string) {
    // If firmId is provided, verify ownership
    if (firmId) {
      const existing = await prisma.products.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('Product not found');
      }
      if (existing.firm_id !== firmId) {
        throw new Error('Forbidden: You can only delete your own products');
      }
    }

    await prisma.products.delete({ where: { id } });
    return true;
  },
};
