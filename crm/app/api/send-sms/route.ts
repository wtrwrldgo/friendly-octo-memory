import { NextResponse } from 'next/server';
import { eskizService } from '@/lib/eskiz';

export async function POST(request: Request) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json(
                { success: false, error: 'Phone number and code are required.' },
                { status: 400 }
            );
        }

        const message = `Your confirmation code for WaterGo: ${code}`;

        // In development mode without credentials, we might want to mock success
        if (!process.env.ESKIZ_EMAIL && process.env.NODE_ENV === 'development') {
            console.log(`[DEV MODE] Mock SMS to ${phone}: ${message}`);
            return NextResponse.json({ success: true, message: 'Mock SMS sent' });
        }

        const sent = await eskizService.sendSMS(phone, message);

        if (sent) {
            return NextResponse.json({ success: true, message: 'SMS sent successfully' });
        } else {
            return NextResponse.json(
                { success: false, error: 'Failed to send SMS via provider.' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('API Error sending SMS:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
