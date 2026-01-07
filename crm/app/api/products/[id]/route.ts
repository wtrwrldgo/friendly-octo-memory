// file: app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthTokenFromCookies } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await request.json();
    const { name, description, price, imageUrl, volume, inStock } = body;

    // Get auth token from cookies for server-side requests
    const authToken = getAuthTokenFromCookies();

    const { data: product, error } = await db.updateProduct(productId, {
      name,
      description,
      price,
      image_url: imageUrl,
      volume,
      in_stock: inStock
    }, { authToken });

    if (error) throw error;

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Get auth token from cookies for server-side requests
    const authToken = getAuthTokenFromCookies();

    const { error } = await db.deleteProduct(productId, { authToken });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
