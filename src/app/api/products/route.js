import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Default to 50 to match init
    const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')) : undefined;
    const categorySlug = searchParams.get('categorySlug');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug && categorySlug !== 'todos') {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { children: true }
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map(c => c.id)];
        where.categoryId = { in: categoryIds };
      } else {
        return NextResponse.json({ products: [], total: 0, pages: 0 });
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: {
            select: {
              name: true,
              slug: true,
              parent: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
