// file: app/api/firms/public/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET public firms (only ACTIVE and visible in client app)
// No auth required - this is the endpoint for Client App
export async function GET(request: NextRequest) {
  try {
    // Get all firms
    const { data: firms, error } = await db.getFirms();

    if (error) throw error;

    // Filter to only return ACTIVE firms that are visible in client app
    const publicFirms = (firms || []).filter(
      (firm: any) => firm.status === 'ACTIVE' && firm.isVisibleInClientApp === true
    );

    return NextResponse.json({ firms: publicFirms }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching public firms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch firms' },
      { status: 500 }
    );
  }
}
