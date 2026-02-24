// file: app/api/staff/firm/[firmId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromCookies } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.watergocrm.uz/api';

// GET staff for a firm
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const authToken = getAuthTokenFromCookies(request);
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    console.log('[STAFF API] GET /api/staff/firm/', firmId);
    console.log('[STAFF API] Auth token:', authToken ? 'present' : 'missing');
    console.log('[STAFF API] API_URL:', API_URL);

    // Backend uses /staff?firmId=xxx&branchId=xxx (not /staff/firm/:firmId)
    const queryParams = new URLSearchParams({ firmId });
    if (branchId) queryParams.append('branchId', branchId);

    const backendUrl = `${API_URL}/staff?${queryParams.toString()}`;
    console.log('[STAFF API] Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch staff');
    }

    // Transform snake_case to camelCase for frontend
    const transformedData = (result.data || []).map((s: any) => ({
      id: s.id,
      firmId: s.firm_id,
      branchId: s.branch_id,
      name: s.name,
      phone: s.phone,
      email: s.email,
      role: s.role,
      active: s.is_active,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));

    return NextResponse.json({ success: true, data: transformedData }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch staff', debug: 'CRM route was hit' },
      { status: 500 }
    );
  }
}
