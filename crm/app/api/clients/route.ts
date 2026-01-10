// file: app/api/clients/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthTokenFromCookies } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

// GET all clients (users who made orders from clientApp) - supports branch filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firmId = searchParams.get('firmId') || searchParams.get('firm_id');
    const branchId = searchParams.get('branchId') || searchParams.get('branch_id') || undefined;
    const canAccessAllBranches = searchParams.get('canAccessAllBranches') === 'true';

    console.log('[CRM API /api/clients] Request params:', { firmId, branchId, canAccessAllBranches, searchParams: searchParams.toString() });

    // Get auth token from cookies for server-side requests
    const authToken = getAuthTokenFromCookies();

    const { data: clients, error } = await db.getClients(firmId || undefined, branchId, canAccessAllBranches, { authToken });

    console.log('[CRM API /api/clients] Response:', {
      clientCount: clients?.length,
      error: error?.message,
      firstClient: clients?.[0] ? {
        name: clients[0].name,
        totalOrders: clients[0].totalOrders,
        revenue: clients[0].revenue,
        address: clients[0].address,
      } : null
    });

    if (error) throw error;

    return NextResponse.json({ clients: clients || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST create new client - not typically used (clients register via clientApp)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(
      { error: 'Clients register via the mobile app' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 500 }
    );
  }
}
