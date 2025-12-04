import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - Get home page content
export async function GET() {
    try {
        // Find the first record, or create default if it doesn't exist
        let content = await prisma.homePageContent.findFirst();

        if (!content) {
            content = await prisma.homePageContent.create({
                data: {} // Uses default values from schema
            });
        }

        return NextResponse.json(content);
    } catch (error) {
        console.error('Error fetching home page content:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

// PUT - Update home page content (Admin only)
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // We always update the first record (id: 1) or create if missing
        const content = await prisma.homePageContent.upsert({
            where: { id: 1 },
            update: {
                heroTitle: body.heroTitle,
                heroSubtitle: body.heroSubtitle,
                heroButtonText: body.heroButtonText,
                heroImage: body.heroImage,
                aboutTitle: body.aboutTitle,
                aboutText: body.aboutText,
                aboutImage1: body.aboutImage1,
                aboutImage2: body.aboutImage2,
            },
            create: {
                heroTitle: body.heroTitle,
                heroSubtitle: body.heroSubtitle,
                heroButtonText: body.heroButtonText,
                heroImage: body.heroImage,
                aboutTitle: body.aboutTitle,
                aboutText: body.aboutText,
                aboutImage1: body.aboutImage1,
                aboutImage2: body.aboutImage2,
            }
        });

        return NextResponse.json(content);
    } catch (error) {
        console.error('Error updating home page content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}
