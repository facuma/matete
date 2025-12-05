import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { reservationIds, sessionId, cookieId } = body;

        // Support releasing by reservation IDs or by session/cookie
        let reservations;

        if (reservationIds && Array.isArray(reservationIds)) {
            reservations = await prisma.stockReservation.findMany({
                where: {
                    id: { in: reservationIds },
                    status: 'active'
                }
            });
        } else if (sessionId || cookieId) {
            reservations = await prisma.stockReservation.findMany({
                where: {
                    OR: [
                        sessionId ? { sessionId } : {},
                        cookieId ? { cookieId } : {}
                    ],
                    status: 'active'
                }
            });
        } else {
            return NextResponse.json({
                error: 'Either reservationIds or sessionId/cookieId is required'
            }, { status: 400 });
        }

        if (reservations.length === 0) {
            return NextResponse.json({
                message: 'No active reservations found to release'
            });
        }

        // Release reservations in transaction
        await prisma.$transaction(async (tx) => {
            for (const reservation of reservations) {
                // Mark reservation as released
                await tx.stockReservation.update({
                    where: { id: reservation.id },
                    data: { status: 'released' }
                });

                // Decrement reserved stock
                await tx.product.update({
                    where: { id: reservation.productId },
                    data: {
                        reservedStock: { decrement: reservation.quantity }
                    }
                });
            }
        });

        return NextResponse.json({
            success: true,
            releasedCount: reservations.length,
            message: 'Stock released successfully'
        });

    } catch (error) {
        console.error('Error releasing stock:', error);
        return NextResponse.json({
            error: 'Failed to release stock',
            details: error.message
        }, { status: 500 });
    }
}
