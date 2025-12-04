import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/admin-utils';

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

// POST - Create new order
export async function POST(request) {
    try {
        const body = await request.json();

        // Handle discount code usage
        if (body.discountCode) {
            const discount = await prisma.discountCode.findUnique({
                where: { code: body.discountCode }
            });

            if (discount) {
                await prisma.discountCode.update({
                    where: { id: discount.id },
                    data: { usedCount: { increment: 1 } }
                });
            }
        }

        const newOrder = await prisma.order.create({
            data: {
                customerName: body.customer.name,
                customerEmail: body.customer.email || null,
                customerAddress: body.customer.address,
                customerCity: body.customer.city,
                items: body.items,
                total: body.total,
                paymentMethod: body.paymentMethod || 'card',
                paymentDetails: body.paymentDetails || null,
                status: body.status || (body.paymentMethod === 'transfer' ? 'Pendiente' : 'Procesando'),
                userId: body.userId || null,
                discountCode: body.discountCode || null
            }
        });

        // Log activity
        await logActivity('order_created', `Nueva orden de ${newOrder.customerName}`, {
            orderId: newOrder.id,
            total: newOrder.total,
            discountCode: body.discountCode
        });

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
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

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
