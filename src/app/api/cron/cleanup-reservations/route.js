import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        // Verify authorization (basic protection)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();

        // Find all expired active reservations
        const expiredReservations = await prisma.stockReservation.findMany({
            where: {
                status: 'active',
                expiresAt: {
                    lt: now
                }
            }
        });

        if (expiredReservations.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No expired reservations found',
                cleaned: 0
            });
        }

        // Release reservations in transaction
        let cleaned = 0;
        await prisma.$transaction(async (tx) => {
            for (const reservation of expiredReservations) {
                // Mark as released
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

                cleaned++;
            }
        });

        console.log(`Cleaned up ${cleaned} expired stock reservations`);

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${cleaned} expired reservations`,
            cleaned
        });

    } catch (error) {
        console.error('Error cleaning up reservations:', error);
        return NextResponse.json({
            error: 'Failed to cleanup reservations',
            details: error.message
        }, { status: 500 });
    }
}
