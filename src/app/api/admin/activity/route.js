import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get recent activity
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.activity.count()
        ]);

        return NextResponse.json({
            activities,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
