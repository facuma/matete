import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { reservationIds, items, orderId } = body;

        // Support both reservation-based and direct item-based decrement
        if (!reservationIds && !items) {
            return NextResponse.json({
                error: 'Either reservationIds or items array is required'
            }, { status: 400 });
        }

        const results = [];
        const errors = [];

        // Use transaction to ensure atomicity and prevent race conditions
        try {
            await prisma.$transaction(async (tx) => {
                // MODE 1: Using reservationIds (from checkout flow)
                if (reservationIds && Array.isArray(reservationIds) && reservationIds.length > 0) {
                    for (const reservationId of reservationIds) {
                        const reservation = await tx.stockReservation.findUnique({
                            where: { id: reservationId },
                            include: { product: true }
                        });

                        if (!reservation) {
                            errors.push({
                                reservationId,
                                error: 'Reservation not found'
                            });
                            continue;
                        }

                        if (reservation.status !== 'active') {
                            errors.push({
                                reservationId,
                                error: `Reservation is ${reservation.status}, expected active`
                            });
                            continue;
                        }

                        if (reservation.product.stock < reservation.quantity) {
                            errors.push({
                                reservationId,
                                productId: reservation.productId,
                                error: 'Insufficient stock for final decrement',
                                available: reservation.product.stock,
                                required: reservation.quantity
                            });
                            continue;
                        }

                        // Decrement both stock and reservedStock
                        await tx.product.update({
                            where: { id: reservation.productId },
                            data: {
                                stock: { decrement: reservation.quantity },
                                reservedStock: { decrement: reservation.quantity }
                            }
                        });

                        // Mark reservation as completed
                        await tx.stockReservation.update({
                            where: { id: reservationId },
                            data: { status: 'completed' }
                        });

                        results.push({
                            reservationId,
                            productId: reservation.productId,
                            quantity: reservation.quantity,
                            success: true
                        });
                    }
                }

                // MODE 2: Using items directly (from admin manual update)
                if (items && Array.isArray(items) && items.length > 0) {
                    for (const item of items) {
                        const product = await tx.product.findUnique({
                            where: { id: item.id }
                        });

                        if (!product) {
                            errors.push({
                                productId: item.id,
                                error: 'Product not found'
                            });
                            continue;
                        }

                        if (product.stock < item.quantity) {
                            errors.push({
                                productId: item.id,
                                error: 'Insufficient stock',
                                available: product.stock,
                                required: item.quantity
                            });
                            continue;
                        }

                        // Decrement stock AND reservedStock
                        await tx.product.update({
                            where: { id: item.id },
                            data: {
                                stock: { decrement: item.quantity },
                                reservedStock: { decrement: item.quantity }
                            }
                        });

                        results.push({
                            productId: item.id,
                            quantity: item.quantity,
                            success: true
                        });
                    }
                }
            }, {
                timeout: 10000,
                isolationLevel: 'Serializable'
            });
        } catch (transactionError) {
            console.error('Transaction error:', transactionError);
            return NextResponse.json({
                error: 'Transaction failed',
                details: transactionError.message,
                results,
                errors
            }, { status: 500 });
        }

        // If any errors occurred, return partial success
        if (errors.length > 0) {
            return NextResponse.json({
                success: false,
                partialSuccess: results.length > 0,
                results,
                errors,
                message: 'Some stock decrements failed'
            }, { status: 207 }); // Multi-Status
        }

        return NextResponse.json({
            success: true,
            results,
            message: 'Stock decremented successfully'
        });

    } catch (error) {
        console.error('Error decrementing stock:', error);
        return NextResponse.json({
            error: 'Failed to decrement stock',
            details: error.message
        }, { status: 500 });
    }
}
