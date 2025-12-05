import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/admin-utils';
import { sendOrderConfirmation } from '@/lib/email';

// POST - Create new order (Public)
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

        // Secure userId assignment
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
        const session = await getServerSession(authOptions);

        // If user is logged in, attach order to them. If not, it's a guest order (userId: null).
        // We IGNORE body.userId to prevent spoofing.
        const secureUserId = session?.user?.id || null;

        // Secure Status logic
        // Prevent clients from forcing "Pagado" without a valid payment ID (basic check)
        let secureStatus = body.status || 'Procesando';
        if (body.paymentMethod === 'transfer') {
            secureStatus = 'Pendiente';
        } else if (body.paymentMethod === 'card') {
            // Only allow 'Pagado' if we have an external payment ID
            if (body.mercadopagoPaymentId && (body.status === 'Pagado' || body.status === 'approved')) {
                secureStatus = 'Pagado';
            } else {
                secureStatus = 'Procesando';
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
                status: secureStatus,
                shippingMethod: body.shippingMethod || null,
                shippingCost: body.shippingCost || 0,
                mercadopagoPaymentId: body.mercadopagoPaymentId || null,
                mpPaymentStatus: body.mpPaymentStatus || null,
                userId: secureUserId,
                discountCode: body.discountCode || null
            }
        });

        // Log activity (as system/public event)
        try {
            await logActivity('order_created', `Nueva orden pública de ${newOrder.customerName}`, {
                orderId: newOrder.id,
                total: newOrder.total
            });
        } catch (e) {
            console.warn('Failed to log activity for public order', e);
        }

        // Handle stock based on order status (LOGIC COPIED FROM OLD ENDPOINT)
        if (newOrder.status === 'Pagado') {
            try {
                await prisma.$transaction(async (tx) => {
                    for (const item of body.items) {
                        const product = await tx.product.findUnique({
                            where: { id: item.id }
                        });

                        if (!product) continue;

                        if (product.stock < item.quantity) {
                            console.warn(`Insufficient stock for product ${item.id}`);
                            continue;
                        }

                        await tx.product.update({
                            where: { id: item.id },
                            data: { stock: { decrement: item.quantity } }
                        });
                    }
                });
            } catch (error) {
                console.error('Error decrementing stock:', error);
            }
        } else {
            try {
                await prisma.$transaction(async (tx) => {
                    for (const item of body.items) {
                        const product = await tx.product.findUnique({
                            where: { id: item.id }
                        });

                        if (!product) continue;

                        await tx.product.update({
                            where: { id: item.id },
                            data: { reservedStock: { increment: item.quantity } }
                        });
                    }
                });
            } catch (error) {
                console.error('Error reserving stock:', error);
            }
        }

        // Send order confirmation email
        if (newOrder.customerEmail) {
            try {
                await sendOrderConfirmation({
                    ...newOrder,
                    items: newOrder.items,
                    customerName: newOrder.customerName,
                    customerEmail: newOrder.customerEmail,
                    customerAddress: newOrder.customerAddress,
                    customerCity: newOrder.customerCity,
                    shippingMethod: newOrder.shippingMethod,
                    shippingCost: newOrder.shippingCost,
                    paymentMethod: newOrder.paymentMethod
                });
            } catch (emailError) {
                console.error('Error sending order confirmation email:', emailError);
            }
        }

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
