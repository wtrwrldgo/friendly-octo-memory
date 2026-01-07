// file: app/api/clients/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Helper to get auth token from cookies
function getAuthToken(): string | null {
  const cookieStore = cookies();
  // Try both cookie names for compatibility
  return cookieStore.get('auth-token')?.value || cookieStore.get('authToken')?.value || null;
}

// GET single client with firm isolation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken();
    const { searchParams } = new URL(request.url);
    const firmId = searchParams.get('firmId') || searchParams.get('firm_id') || undefined;

    const { data: client, error } = await db.getClientById(params.id, firmId, { authToken: authToken || undefined });

    if (error) throw error;
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ data: client }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// DELETE client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken();
    const { error } = await db.deleteClient(params.id, { authToken: authToken || undefined });

    if (error) throw error;

    return NextResponse.json(
      { message: 'Client deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}
