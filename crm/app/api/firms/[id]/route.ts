// file: app/api/firms/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single firm by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: firm, error } = await db.getFirmById(params.id);

    if (error) throw error;

    if (!firm) {
      return NextResponse.json({ success: false, error: 'Firm not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: firm }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching firm:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch firm' },
      { status: 500 }
    );
  }
}

// PUT update firm
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Get auth token from Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '') ||
                      request.cookies.get('authToken')?.value;

    // Pass through all fields from request body
    const updateData: Record<string, any> = {};

    // String fields
    if (body.name) updateData.name = body.name;
    if (body.city) updateData.city = body.city;
    if (body.status) updateData.status = body.status;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.homeBannerUrl !== undefined) updateData.homeBannerUrl = body.homeBannerUrl;
    if (body.detailBannerUrl !== undefined) updateData.detailBannerUrl = body.detailBannerUrl;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.deliveryTime !== undefined) updateData.deliveryTime = body.deliveryTime;

    // Numeric fields
    if (typeof body.minOrder === 'number') updateData.minOrder = body.minOrder;
    if (typeof body.deliveryFee === 'number') updateData.deliveryFee = body.deliveryFee;
    if (typeof body.deliveryFeePercent === 'number') updateData.deliveryFeePercent = body.deliveryFeePercent;
    if (typeof body.bottleDeposit === 'number') updateData.bottleDeposit = body.bottleDeposit;
    if (typeof body.bottleDepositPrice === 'number') updateData.bottleDepositPrice = body.bottleDepositPrice;
    if (typeof body.scheduleDaysLimit === 'number') updateData.scheduleDaysLimit = body.scheduleDaysLimit;
    if (typeof body.scheduleTimeInterval === 'number') updateData.scheduleTimeInterval = body.scheduleTimeInterval;

    // Boolean fields
    if (typeof body.isVisibleInClientApp === 'boolean') updateData.isVisibleInClientApp = body.isVisibleInClientApp;
    if (typeof body.minOrderEnabled === 'boolean') updateData.minOrderEnabled = body.minOrderEnabled;
    if (typeof body.deliveryFeeEnabled === 'boolean') updateData.deliveryFeeEnabled = body.deliveryFeeEnabled;
    if (typeof body.bottleDepositEnabled === 'boolean') updateData.bottleDepositEnabled = body.bottleDepositEnabled;

    // Enum fields
    if (body.deliveryFeeType) updateData.deliveryFeeType = body.deliveryFeeType;

    const { data: firm, error } = await db.updateFirm(params.id, updateData, { authToken });

    if (error) {
      throw error;
    }

    return NextResponse.json({ firm, success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating firm:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update firm' },
      { status: 500 }
    );
  }
}

// DELETE firm
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '') ||
                      request.cookies.get('authToken')?.value;

    const { error } = await db.deleteFirm(params.id, { authToken });

    if (error) throw error;

    return NextResponse.json(
      { message: 'Firm deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting firm:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete firm' },
      { status: 500 }
    );
  }
}
