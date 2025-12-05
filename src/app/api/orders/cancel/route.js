import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/admin-utils';

export async function POST(request) {
    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({
                error: 'Order ID is required'
            }, { status: 400 });
        }

        // Find the order
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({
                error: 'Order not found'
            }, { status: 404 });
        }

        // Check if already canceled
        if (order.status === 'Cancelado') {
            return NextResponse.json({
                error: 'Order is already canceled'
            }, { status: 400 });
        }

        const oldStatus = order.status;
        let stockRestored = false;
        let reservationsReleased = false;

        // CASE 1: Order was PAID - need to restore stock
        if (oldStatus === 'Pagado' || oldStatus === 'Enviado' || oldStatus === 'Completado') {
            try {
                const orderItems = order.items;

                if (orderItems && orderItems.length > 0) {
                    console.log('Restoring stock for canceled paid order:', orderId);

                    // Use transaction to restore stock atomically
                    await prisma.$transaction(async (tx) => {
                        for (const item of orderItems) {
                            await tx.product.update({
                                where: { id: item.id },
                                data: {
                                    stock: { increment: item.quantity }
                                }
                            });
                        }
                    });

                    stockRestored = true;
                    console.log('Stock restored successfully for order:', orderId);
                }
            } catch (stockError) {
                console.error('Error restoring stock:', stockError);
                return NextResponse.json({
                    error: 'Failed to restore stock',
                    details: stockError.message
                }, { status: 500 });
            }
        }

        // CASE 2: Order was PENDING - release reserved stock
        if (oldStatus === 'Pendiente' || oldStatus === 'Procesando') {
            try {
                const orderItems = order.items;

                if (orderItems && orderItems.length > 0) {
                    console.log('Releasing reserved stock for canceled pending order:', orderId);

                    // Use transaction to release reserved stock atomically
                    await prisma.$transaction(async (tx) => {
                        for (const item of orderItems) {
                            await tx.product.update({
                                where: { id: item.id },
                                data: {
                                    reservedStock: { decrement: item.quantity }
                                }
                            });
                        }
                    });

                    reservationsReleased = true;
                    console.log('Reserved stock released successfully for order:', orderId);
                }
            } catch (releaseError) {
                console.error('Error releasing reserved stock:', releaseError);
                // Don't fail the cancellation
            }
        }

        // Update order status to Canceled
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'Cancelado' }
        });

        // Send cancellation email
        if (updatedOrder.customerEmail) {
            try {
                const { sendOrderCanceled } = await import('@/lib/email');
                await sendOrderCanceled({
                    ...updatedOrder,
                    items: updatedOrder.items,
                    customerName: updatedOrder.customerName,
                    customerEmail: updatedOrder.customerEmail
                });
            } catch (emailError) {
                console.error('Error sending order canceled email:', emailError);
                // Don't fail the cancellation if email fails
            }
        }

        // Log activity
        await logActivity('order_canceled', `Orden ${orderId} cancelada (cambio de ${oldStatus} a Cancelado)`, {
            orderId,
            oldStatus,
            stockRestored,
            reservationsReleased
        });

        return NextResponse.json({
            success: true,
            order: updatedOrder,
            stockRestored,
            reservationsReleased,
            message: 'Order canceled successfully'
        });

    } catch (error) {
        console.error('Error canceling order:', error);
        return NextResponse.json({
            error: 'Failed to cancel order',
            details: error.message
        }, { status: 500 });
    }
}
