// file: app/api/firms/[id]/submit-for-review/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

// PATCH: Submit firm for review (DRAFT → PENDING_REVIEW)
// Only firm owner can submit their own firm
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const firmId = params.id;

    // Get auth token from cookies for server-side API calls
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    // Get current firm to validate status
    const { data: firm, error: fetchError } = await db.getFirmById(firmId);

    if (fetchError) throw fetchError;

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }

    // Validate current status is DRAFT
    if (firm.status !== 'DRAFT') {
      return NextResponse.json(
        { error: `Cannot submit for review. Current status is ${firm.status}. Only DRAFT firms can be submitted.` },
        { status: 400 }
      );
    }

    // Update firm status to PENDING_REVIEW
    const { data: updatedFirm, error: updateError } = await db.updateFirm(firmId, {
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
      // Clear any previous rejection reason
      rejectionReason: null,
    }, { authToken });

    if (updateError) throw updateError;

    return NextResponse.json({
      firm: updatedFirm,
      message: 'Firm submitted for review successfully. Awaiting WaterGo approval.'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error submitting firm for review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit firm for review' },
      { status: 500 }
    );
  }
}
