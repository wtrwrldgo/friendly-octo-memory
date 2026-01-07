// file: app/api/drivers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper to get auth token from cookies
function getAuthToken(): string | null {
  const cookieStore = cookies();
  // Try both cookie names for compatibility
  return cookieStore.get('auth-token')?.value || cookieStore.get('authToken')?.value || null;
}

// GET all drivers (from driverApp) - supports branch filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firmId = searchParams.get('firmId') || searchParams.get('firm_id');
    const branchId = searchParams.get('branchId') || searchParams.get('branch_id') || undefined;
    const canAccessAllBranches = searchParams.get('canAccessAllBranches') === 'true';

    const authToken = getAuthToken();
    const { data: drivers, error } = await db.getDrivers(firmId || undefined, branchId, canAccessAllBranches, { authToken: authToken || undefined });
    if (error) throw error;

    return NextResponse.json({ drivers: drivers || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

// POST create new driver
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Accept both firmId and firm_id for compatibility
    const firmId = body.firmId || body.firm_id;
    const { name, phone } = body;
    // Accept both camelCase and snake_case
    const carPlate = body.carPlate || body.car_plate;
    const carBrand = body.carBrand || body.car_brand;
    const carColor = body.carColor || body.car_color;
    const city = body.city;
    const driverNumber = body.driverNumber || body.driver_number;

    if (!firmId || !name || !phone) {
      return NextResponse.json(
        { error: 'firmId, name, and phone are required' },
        { status: 400 }
      );
    }

    const authToken = getAuthToken();
    const { data: driver, error } = await db.createDriver({
      firmId,
      name,
      phone,
      car_plate: carPlate,
      car_brand: carBrand,
      car_color: carColor,
      city,
      driver_number: driverNumber,
    }, { authToken: authToken || undefined });

    if (error) throw error;

    return NextResponse.json({ driver }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create driver' },
      { status: 500 }
    );
  }
}
