// file: app/api/firms/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { FirmStatus } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://45.92.173.121';

// Helper to get full logo URL
function getFullLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http')) return logoUrl;
  return `${BACKEND_URL}${logoUrl}`;
}

// Helper function to transform backend firm data to CRM format
function transformFirm(backendFirm: any) {
  // Determine status from isActive and status field
  let status: FirmStatus = 'DRAFT';
  if (backendFirm.status) {
    status = backendFirm.status;
  } else if (backendFirm.isActive === true) {
    status = 'ACTIVE';
  } else if (backendFirm.isActive === false) {
    status = 'DRAFT';
  }

  return {
    id: backendFirm.id,
    name: backendFirm.name,
    city: backendFirm.city || '',
    status,
    isVisibleInClientApp: backendFirm.isVisibleInClientApp ?? (status === 'ACTIVE'),
    logoUrl: getFullLogoUrl(backendFirm.logoUrl),
    rating: parseFloat(backendFirm.rating) || 5.0,
    deliveryTime: backendFirm.deliveryTime,
    minOrder: backendFirm.minOrder,
    deliveryFee: backendFirm.deliveryFee,
    clientsCount: backendFirm._count?.clients || 0,
    ordersCount: backendFirm._count?.orders || 0,
    driversCount: backendFirm._count?.drivers || 0,
    createdAt: backendFirm.createdAt,
    submittedAt: backendFirm.submittedAt,
    approvedAt: backendFirm.approvedAt,
    rejectionReason: backendFirm.rejectionReason,
    bottleDepositEnabled: backendFirm.bottleDepositEnabled ?? false,
    bottleDepositPrice: backendFirm.bottleDepositPrice ?? 15000,
  };
}

// GET all firms
export async function GET() {
  try {
    const { data: firms, error } = await db.getFirms();

    if (error) throw error;

    // Transform backend data to CRM format
    const transformedFirms = Array.isArray(firms)
      ? firms.map(transformFirm)
      : [];

    return NextResponse.json({ firms: transformedFirms }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching firms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch firms' },
      { status: 500 }
    );
  }
}

// POST create new firm (with owner account)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      city,
      logoUrl,
      // Owner details for creating firm owner account
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerPassword
    } = body;

    if (!name || !city) {
      return NextResponse.json(
        { error: 'Name and city are required' },
        { status: 400 }
      );
    }

    // Create firm in DRAFT status (not visible in client app)
    const { data: firm, error } = await db.createFirm({
      name,
      city,
      logoUrl,
      status: 'DRAFT',
      isVisibleInClientApp: false,
      clients_count: 0,
      orders_count: 0,
      drivers_count: 0,
    });

    if (error) throw error;

    // If owner details provided, create owner account
    // This will be handled by the backend when it receives the firm creation request
    // The backend should create a Staff record with role OWNER

    return NextResponse.json({
      firm,
      message: 'Firm created in draft mode. Owner can login to complete setup.'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating firm:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create firm' },
      { status: 500 }
    );
  }
}
