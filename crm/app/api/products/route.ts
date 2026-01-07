// file: app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthTokenFromCookies } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

// GET all products (same products shown in clientApp)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firmId = searchParams.get('firm_id');

    const { data: products, error } = await db.getProducts(firmId || undefined);
    if (error) throw error;

    return NextResponse.json({ products: products || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firmId, name, description, price, imageUrl, volume, inStock } = body;
    const authToken = getAuthTokenFromCookies();

    if (!firmId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'firmId, name, and price are required' },
        { status: 400 }
      );
    }

    const { data: product, error } = await db.createProduct(
      {
        firm_id: firmId,
        name,
        description: description || '',
        price,
        image_url: imageUrl || null,
        volume: volume || '19L',
        in_stock: inStock !== false,
      },
      { authToken }
    );

    if (error) throw error;

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
