import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        let whereClause = {};
        if (!isNaN(id)) {
            whereClause = { id: id };
        } else {
            whereClause = { slug: idParam };
        }

        const product = await prisma.product.findUnique({
            where: whereClause,
            include: {
                options: {
                    include: {
                        values: {
                            include: {
                                linkedProduct: true
                            }
                        }
                    }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}
