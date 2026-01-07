// file: app/api/firms/[id]/approve/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH: Approve firm (PENDING_REVIEW → ACTIVE)
// Only WaterGo Admin can approve firms
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const firmId = params.id;

    // Get current firm to validate status
    const { data: firm, error: fetchError } = await db.getFirmById(firmId);

    if (fetchError) throw fetchError;

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }

    // Validate current status is PENDING_REVIEW
    if (firm.status !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { error: `Cannot approve firm. Current status is ${firm.status}. Only PENDING_REVIEW firms can be approved.` },
        { status: 400 }
      );
    }

    // Update firm status to ACTIVE and make visible in client app
    const { data: updatedFirm, error: updateError } = await db.updateFirm(firmId, {
      status: 'ACTIVE',
      isVisibleInClientApp: true,
      approvedAt: new Date().toISOString(),
    });

    if (updateError) throw updateError;

    return NextResponse.json({
      firm: updatedFirm,
      message: 'Firm approved and is now visible to clients.'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error approving firm:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve firm' },
      { status: 500 }
    );
  }
}
