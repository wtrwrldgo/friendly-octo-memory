// file: app/api/branches/route.ts

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://45.92.173.121/api';

// GET branches for a firm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firmId = searchParams.get('firmId') || searchParams.get('firm_id');

    if (!firmId) {
      return NextResponse.json(
        { error: 'firmId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/branches/firm/${firmId}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch branches');
    }

    return NextResponse.json({ branches: result.data || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}
