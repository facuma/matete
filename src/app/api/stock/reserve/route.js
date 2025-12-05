import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { items, sessionId, cookieId } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
        }

        if (!sessionId && !cookieId) {
            return NextResponse.json({ error: 'Session ID or Cookie ID is required' }, { status: 400 });
        }

        const reservations = [];
        const errors = [];

        // Use transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const { productId, quantity } = item;

                // Get current product stock
                const product = await tx.product.findUnique({
                    where: { id: productId },
                    select: { stock: true, reservedStock: true, name: true }
                });

                if (!product) {
                    errors.push({ productId, error: 'Product not found' });
                    continue;
                }

                // Calculate available stock
                const availableStock = product.stock - product.reservedStock;

                if (availableStock < quantity) {
                    errors.push({
                        productId,
                        productName: product.name,
                        error: 'Insufficient stock',
                        available: availableStock,
                        requested: quantity
                    });
                    continue;
                }

                // Create reservation (expires in 15 minutes)
                const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

                const reservation = await tx.stockReservation.create({
                    data: {
                        productId,
                        quantity,
                        sessionId: sessionId || null,
                        cookieId: cookieId || null,
                        expiresAt,
                        status: 'active'
                    }
                });

                // Increment reserved stock
                await tx.product.update({
                    where: { id: productId },
                    data: {
                        reservedStock: { increment: quantity }
                    }
                });

                reservations.push({
                    reservationId: reservation.id,
                    productId,
                    quantity,
                    expiresAt
                });
            }
        });

        // If any errors occurred, return them
        if (errors.length > 0) {
            return NextResponse.json({
                success: false,
                errors,
                reservations
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            reservations,
            message: 'Stock reserved successfully'
        });

    } catch (error) {
        console.error('Error reserving stock:', error);
        return NextResponse.json({
            error: 'Failed to reserve stock',
            details: error.message
        }, { status: 500 });
    }
}
