import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Use a transaction or sequential awaits to ensure we reuse the connection efficiently
        // Promise.all might start parallel queries on same connection, which is fine for connection limit 1
        // as Prisma serializes them on the single connection.

        const [categories, products, content, settings] = await Promise.all([
            // 1. Categories
            prisma.category.findMany({
                where: { parentId: null },
                include: {
                    children: {
                        orderBy: { name: 'asc' },
                        include: { _count: { select: { products: true } } }
                    },
                    _count: { select: { products: true } }
                },
                orderBy: { name: 'asc' }
            }),

            // 2. Products
            prisma.product.findMany({
                orderBy: { createdAt: 'desc' },
                take: 12, // Limit to avoidance of OOM - Optimized from 50
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    promotionalPrice: true,
                    images: true,
                    imageUrl: true,
                    rating: true,
                    stock: true,
                    categoryId: true,
                    category: {
                        select: {
                            name: true,
                            slug: true
                        }
                    },
                    options: {
                        select: {
                            id: true,
                            name: true,
                            values: {
                                select: {
                                    id: true,
                                    name: true,
                                    priceModifier: true,
                                    linkedProduct: {
                                        select: {
                                            id: true,
                                            name: true,
                                            imageUrl: true,
                                            images: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),

            // 3. Home Content
            prisma.homePageContent.findFirst(),

            // 4. Site Settings (for Transfer Discount)
            prisma.siteSettings.findFirst({
                select: { transferDiscountPercentage: true }
            })
        ]);

        return NextResponse.json({
            categories: categories || [],
            products: products || [],
            content: {
                ...content,
                transferDiscount: settings?.transferDiscountPercentage || 0
            }
        });
    } catch (error) {
        console.error('Error in /api/init:', error);
        return NextResponse.json({ error: 'Failed to initialize data' }, { status: 500 });
    }
}
