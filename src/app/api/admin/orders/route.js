import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/admin-utils';
import { sendOrderConfirmation, sendPaymentApproved } from '@/lib/email';

// GET - Get all orders
export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}


// PATCH - Update order status
export async function PATCH(request) {
    try {
        const body = await request.json();

        const order = await prisma.order.findUnique({
            where: { id: body.id }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const oldStatus = order.status;
        const updatedOrder = await prisma.order.update({
            where: { id: body.id },
            data: { status: body.status }
        });

        // Log activity
        await logActivity('order_updated', `Estado de orden ${body.id} cambiado de ${oldStatus} a ${body.status}`, {
            orderId: body.id,
            oldStatus,
            newStatus: body.status
        });

        // Send payment approved email if status changed to 'Pagado'
        if (body.status === 'Pagado' && oldStatus !== 'Pagado' && updatedOrder.customerEmail) {
            try {
                await sendPaymentApproved({
                    ...updatedOrder,
                    items: updatedOrder.items,
                    customerName: updatedOrder.customerName,
                    customerEmail: updatedOrder.customerEmail,
                    shippingMethod: updatedOrder.shippingMethod,
                    shippingCost: updatedOrder.shippingCost,
                    mercadopagoPaymentId: updatedOrder.mercadopagoPaymentId
                });
            } catch (emailError) {
                console.error('Error sending payment approved email:', emailError);
            }
        }

        // Decrement stock if admin manually marks as paid
        if (body.status === 'Pagado' && oldStatus !== 'Pagado') {
            try {
                const orderItems = updatedOrder.items;

                if (orderItems && orderItems.length > 0) {
                    console.log('Admin marked as paid, decrementing stock for items:', orderItems);

                    const decrementResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stock/decrement`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            items: orderItems.map(item => ({
                                id: item.id,
                                quantity: item.quantity
                            }))
                        })
                    });

                    if (!decrementResponse.ok) {
                        const errorText = await decrementResponse.text();
                        console.error('Failed to decrement stock:', errorText);
                    } else {
                        const result = await decrementResponse.json();
                        console.log('Stock decremented successfully by admin action:', result);
                    }
                } else {
                    console.warn('No items found in order, cannot decrement stock');
                }
            } catch (stockError) {
                console.error('Error decrementing stock on admin update:', stockError);
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
