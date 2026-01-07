// file: app/api/firms/[id]/reject/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH: Reject firm (PENDING_REVIEW → DRAFT)
// Only WaterGo Admin can reject firms
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const firmId = params.id;
    const body = await request.json();
    const { reason } = body;

    // Rejection reason is required
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Get current firm to validate status
    const { data: firm, error: fetchError } = await db.getFirmById(firmId);

    if (fetchError) throw fetchError;

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }

    // Validate current status is PENDING_REVIEW
    if (firm.status !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { error: `Cannot reject firm. Current status is ${firm.status}. Only PENDING_REVIEW firms can be rejected.` },
        { status: 400 }
      );
    }

    // Update firm status back to DRAFT with rejection reason
    const { data: updatedFirm, error: updateError } = await db.updateFirm(firmId, {
      status: 'DRAFT',
      rejectionReason: reason.trim(),
      // Clear submittedAt so they can resubmit
      submittedAt: null,
    });

    if (updateError) throw updateError;

    return NextResponse.json({
      firm: updatedFirm,
      message: 'Firm rejected and returned to draft status.'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error rejecting firm:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject firm' },
      { status: 500 }
    );
  }
}
