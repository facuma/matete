import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: 1 },
        });
        return NextResponse.json(settings || {});
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const data = await req.json();
        const settings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: {
                facebookPixelId: data.facebookPixelId,
            },
            create: {
                id: 1,
                facebookPixelId: data.facebookPixelId,
            },
        });
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }
}
