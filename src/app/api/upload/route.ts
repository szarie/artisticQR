import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const backendurl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

        if (!backendurl) {
            return NextResponse.json(
                { error: 'Backend URL is not configured' },
                { status: 500 }
            );
        }
        const backendRes = await fetch(`${backendurl}/api/qrcode/upload`, {
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
                'Content-Type': 'image/png',
            },
        });


    } catch (error) {
        console.error('ApI route error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

