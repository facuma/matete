import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');

    let where = {};

    if (categorySlug && categorySlug !== 'todos') {
      // Find category and its children
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { children: true }
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map(c => c.id)];
        where = {
          categoryId: { in: categoryIds }
        };
      } else {
        // Fallback for legacy string categories if needed, or simply return empty if category not found in DB
        // For now, let's assume if not found in DB, maybe it's a legacy string match?
        // where = { category: categorySlug }; // Uncomment if you want legacy fallback
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        category: {
          include: { parent: true }
        },
        options: { include: { values: true } }
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}
