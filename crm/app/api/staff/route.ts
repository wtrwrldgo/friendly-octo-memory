import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.watergocrm.uz/api';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');

        const response = await fetch(`${API_URL}/staff`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { 'Authorization': authHeader } : {}),
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
