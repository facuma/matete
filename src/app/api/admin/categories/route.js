import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: List all categories (Hierarchical)
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: {
                parentId: null // Get root categories
            },
            include: {
                children: {
                    orderBy: { name: 'asc' },
                    include: {
                        _count: {
                            select: { products: true }
                        }
                    }
                },
                _count: {
                    select: { products: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
    }
}

// POST: Create a new category
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, slug, showInNavbar, parentId } = await req.json();

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 });
        }

        // Validation for Max Depth = 2
        if (parentId) {
            const parent = await prisma.category.findUnique({
                where: { id: parseInt(parentId) }
            });

            if (!parent) {
                return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
            }

            if (parent.parentId) {
                return NextResponse.json({ error: 'Maximum category depth exceeded (Max levels: 2)' }, { status: 400 });
            }
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                showInNavbar: showInNavbar || false,
                parentId: parentId ? parseInt(parentId) : null
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        // Handle unique slug constraint
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error creating category' }, { status: 500 });
    }
}
