// file: app/api/drivers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Helper to get auth token from cookies
function getAuthToken(): string | null {
  const cookieStore = cookies();
  // Try both cookie names for compatibility
  return cookieStore.get('auth-token')?.value || cookieStore.get('authToken')?.value || null;
}

// GET single driver
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: driver, error } = await db.getDriverById(params.id);

    if (error) throw error;
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ driver }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch driver' },
      { status: 500 }
    );
  }
}

// PATCH update driver (status, location, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Build update object - accept both camelCase and snake_case
    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.car_plate !== undefined) updates.car_plate = body.car_plate;
    if (body.carPlate !== undefined) updates.car_plate = body.carPlate;
    if (body.car_brand !== undefined) updates.car_brand = body.car_brand;
    if (body.carBrand !== undefined) updates.car_brand = body.carBrand;
    if (body.car_color !== undefined) updates.car_color = body.car_color;
    if (body.carColor !== undefined) updates.car_color = body.carColor;
    if (body.city !== undefined) updates.city = body.city;
    if (body.status !== undefined) updates.status = body.status;
    if (body.is_available !== undefined) updates.is_available = body.is_available;

    const authToken = getAuthToken();
    const { data: driver, error } = await db.updateDriver(params.id, updates, { authToken: authToken || undefined });

    if (error) throw error;

    return NextResponse.json({ driver }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating driver:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update driver' },
      { status: 500 }
    );
  }
}

// DELETE driver
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken();
    const { error } = await db.deleteDriver(params.id, { authToken: authToken || undefined });

    if (error) throw error;

    return NextResponse.json(
      { message: 'Driver deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting driver:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete driver' },
      { status: 500 }
    );
  }
}
