// file: app/api/staff/firm/[firmId]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://45.92.173.121/api';

// GET staff for a firm
export async function GET(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    const queryParams = branchId ? `?branchId=${branchId}` : '';

    const response = await fetch(`${API_URL}/staff/firm/${params.firmId}${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch staff');
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}
