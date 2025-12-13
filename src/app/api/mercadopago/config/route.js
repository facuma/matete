import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

        // Return DB key if connected, otherwise fallback to env
        const publicKey = settings?.mpPublicKey || process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

        return NextResponse.json({
            publicKey,
            connected: !!settings?.mpAccessToken
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
