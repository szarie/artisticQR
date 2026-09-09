import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const backendUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL)?.replace(/\/+$/, '');

        if (!backendUrl) {
            return NextResponse.json(
                { error: 'Backend URL is not configured' },
                { status: 500 }
            );
        }
        const backendRes = await fetch(`${backendUrl}/api/qrcode/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!backendRes.ok) {
            const errorText = await backendRes.text();
            return NextResponse.json(
                { error: `Backend error: ${errorText}` },
                { status: backendRes.status }
            );
        }

        const blob = await backendRes.blob();

        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': backendRes.headers.get('content-type') || 'image/png',
            },
        });


    } catch (error) {
        console.error('API route error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Unable to reach QR backend: ${message}` },
            { status: 500 }
        );
    }
}
