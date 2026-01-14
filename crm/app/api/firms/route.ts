// file: app/api/firms/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { FirmStatus } from '@/types';

// Use the VPS IP directly for static files (logo images)
const STATIC_FILES_URL = 'https://api.watergocrm.uz';

// Helper to get full logo URL
function getFullLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http')) return logoUrl;
  // Ensure the path starts with /
  const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
  return `${STATIC_FILES_URL}${path}`;
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
    // Handle both camelCase and snake_case for city
    city: backendFirm.city || backendFirm.address || backendFirm.location || '',
    status,
    isVisibleInClientApp: backendFirm.isVisibleInClientApp ?? backendFirm.is_visible_in_client_app ?? (status === 'ACTIVE'),
    // Handle both camelCase and snake_case for logoUrl
    logoUrl: getFullLogoUrl(backendFirm.logoUrl || backendFirm.logo_url || backendFirm.logo),
    rating: parseFloat(backendFirm.rating) || 5.0,
    deliveryTime: backendFirm.deliveryTime || backendFirm.delivery_time,
    minOrder: backendFirm.minOrder || backendFirm.min_order,
    deliveryFee: backendFirm.deliveryFee || backendFirm.delivery_fee,
    clientsCount: backendFirm._count?.clients || backendFirm.clientsCount || backendFirm.clients_count || 0,
    ordersCount: backendFirm._count?.orders || backendFirm.ordersCount || backendFirm.orders_count || 0,
    driversCount: backendFirm._count?.drivers || backendFirm.driversCount || backendFirm.drivers_count || 0,
    // Handle both camelCase and snake_case for createdAt
    createdAt: backendFirm.createdAt || backendFirm.created_at || new Date().toISOString(),
    submittedAt: backendFirm.submittedAt || backendFirm.submitted_at,
    approvedAt: backendFirm.approvedAt || backendFirm.approved_at,
    rejectionReason: backendFirm.rejectionReason || backendFirm.rejection_reason,
    bottleDepositEnabled: backendFirm.bottleDepositEnabled ?? backendFirm.bottle_deposit_enabled ?? false,
    bottleDepositPrice: backendFirm.bottleDepositPrice ?? backendFirm.bottle_deposit_price ?? 15000,
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
