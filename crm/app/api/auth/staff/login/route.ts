import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://45.92.173.121/api';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Proxy to backend API
        const response = await fetch(`${API_URL}/auth/staff/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('API proxy error:', error);
        return NextResponse.json(
            { success: false, error: { message: 'Failed to connect to backend' } },
            { status: 500 }
        );
    }
}
