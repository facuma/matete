import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all enabled shipping options
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeDisabled = searchParams.get('includeDisabled') === 'true';

        const options = await prisma.shippingOption.findMany({
            where: includeDisabled ? {} : { enabled: true },
            orderBy: { price: 'asc' }
        });

        return NextResponse.json(options);
    } catch (error) {
        console.error('Error fetching shipping options:', error);
        return NextResponse.json({
            error: 'Failed to fetch shipping options'
        }, { status: 500 });
    }
}
