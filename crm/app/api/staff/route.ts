import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromCookies } from '@/lib/auth-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.watergocrm.uz/api';

export async function GET(request: NextRequest) {
    try {
        const authToken = getAuthTokenFromCookies(request);

        const response = await fetch(`${API_URL}/staff`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Failed to fetch staff:', error);
        return NextResponse.json(
            { success: false, error: { message: 'Failed to fetch staff' } },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authToken = getAuthTokenFromCookies(request);
        const body = await request.json();

        const response = await fetch(`${API_URL}/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json(result, { status: response.status });
        }

        // Transform snake_case to camelCase for frontend
        const s = result.data;
        const transformedData = s ? {
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
        } : null;

        return NextResponse.json({ success: true, data: transformedData }, { status: response.status });
    } catch (error) {
        console.error('Failed to create staff:', error);
        return NextResponse.json(
            { success: false, error: { message: 'Failed to create staff' } },
            { status: 500 }
        );
    }
}
