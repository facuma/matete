import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const { token, userId, platform } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Upsert the token (update if exists, create if not)
        const deviceToken = await prisma.deviceToken.upsert({
            where: { token },
            update: {
                userId: userId || null,
                platform: platform || 'unknown',
                updatedAt: new Date()
            },
            create: {
                token,
                userId: userId || null,
                platform: platform || 'unknown'
            }
        });

        return NextResponse.json({ success: true, deviceToken });
    } catch (error) {
        console.error('Error registering push token:', error);
        return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
    }
}
