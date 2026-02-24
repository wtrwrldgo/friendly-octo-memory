import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromCookies } from '@/lib/auth-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.watergocrm.uz/api';

// Transform snake_case response to camelCase
function transformStaff(s: any) {
    if (!s) return null;
    return {
        id: s.id,
        firmId: s.firm_id,
        branchId: s.branch_id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        role: s.role,
        active: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authToken = getAuthTokenFromCookies(request);

        const response = await fetch(`${API_URL}/staff/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json(result, { status: response.status });
        }

        return NextResponse.json({ success: true, data: transformStaff(result.data) }, { status: response.status });
    } catch (error) {
        console.error('Failed to fetch staff:', error);
        return NextResponse.json(
            { success: false, error: { message: 'Failed to fetch staff' } },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authToken = getAuthTokenFromCookies(request);
        const body = await request.json();

        // Transform camelCase to what backend expects
        const backendBody: any = {};
        if (body.name !== undefined) backendBody.name = body.name;
        if (body.phone !== undefined) backendBody.phone = body.phone;
        if (body.email !== undefined) backendBody.email = body.email;
        if (body.role !== undefined) backendBody.role = body.role;
        if (body.active !== undefined) backendBody.isActive = body.active;
        if (body.branchId !== undefined) backendBody.branchId = body.branchId;

        const response = await fetch(`${API_URL}/staff/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify(backendBody),
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json(result, { status: response.status });
        }

        return NextResponse.json({ success: true, data: transformStaff(result.data) }, { status: response.status });
    } catch (error) {
        console.error('Failed to update staff:', error);
        return NextResponse.json(
            { success: false, error: { message: 'Failed to update staff' } },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authToken = getAuthTokenFromCookies(request);

        const response = await fetch(`${API_URL}/staff/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Failed to delete staff:', error);
        return NextResponse.json(
            { success: false, error: { message: 'Failed to delete staff' } },
            { status: 500 }
        );
    }
}
