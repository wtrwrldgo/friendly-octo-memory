// file: app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all orders - supports branch filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firmId = searchParams.get('firmId') || searchParams.get('firm_id');
    const branchId = searchParams.get('branchId') || searchParams.get('branch_id') || undefined;
    const canAccessAllBranches = searchParams.get('canAccessAllBranches') === 'true';

    const { data: orders, error } = await db.getOrders(firmId || undefined, branchId, canAccessAllBranches);

    if (error) throw error;

    // Debug: log first order structure to Vercel logs
    if (orders && orders.length > 0) {
      const first = orders[0];
      console.log('[API/orders] First order structure:', JSON.stringify({
        id: first.id,
        addresses: first.addresses,
        address: first.address,
        drivers: first.drivers,
        driver: first.driver,
        driver_id: first.driver_id,
      }, null, 2));
    }

    return NextResponse.json({ success: true, data: orders || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create new order - orders are created via clientApp
export async function POST(request: NextRequest) {
  try {
    // Orders are created via the client mobile app
    // CRM is for viewing and managing orders, not creating them
    return NextResponse.json(
      { error: 'Orders are created via the mobile app' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
