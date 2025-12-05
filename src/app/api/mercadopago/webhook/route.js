import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { sendOrderConfirmation, sendPaymentApproved } from '@/lib/email';
import { logActivity } from '@/lib/admin-utils';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

export async function POST(request) {
    try {
        const body = await request.json();

        console.log('Webhook received:', JSON.stringify(body, null, 2));

        // MercadoPago sends notification with type and data.id
        const { type, data } = body;

        if (!type || !data?.id) {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // We only care about payment events
        if (type !== 'payment') {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        const paymentId = data.id;

        // Get payment details from MercadoPago
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });

        console.log('Payment info:', JSON.stringify(paymentInfo, null, 2));

        // Find order by payment ID
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { mercadopagoPaymentId: paymentId.toString() },
                    {
                        paymentDetails: {
                            path: ['paymentId'],
                            equals: paymentId.toString()
                        }
                    }
                ]
            }
        });

        if (!order) {
            console.log('Order not found for payment ID:', paymentId);
            // This might be a payment.created event before order creation
            // We'll handle this in the checkout flow instead
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // Determine new order status based on payment status
        let newStatus = order.status;
        let shouldDecrementStock = false;
        let shouldSendApprovedEmail = false;

        switch (paymentInfo.status) {
            case 'approved':
                newStatus = 'Pagado';
                shouldDecrementStock = true;
                shouldSendApprovedEmail = true;
                break;
            case 'pending':
            case 'in_process':
            case 'in_mediation':
                newStatus = 'Pendiente';
                break;
            case 'rejected':
            case 'cancelled':
            case 'refunded':
            case 'charged_back':
                newStatus = 'Cancelado';
                // TODO: Release stock reservation
                break;
            default:
                console.log('Unknown payment status:', paymentInfo.status);
                break;
        }

        // Update order
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
                status: newStatus,
                mpPaymentStatus: paymentInfo.status,
                mercadopagoPaymentId: paymentId.toString()
            }
        });

        // Decrement stock if payment approved
        if (shouldDecrementStock) {
            try {
                // Get reservation IDs from order paymentDetails
                const reservationIds = order.paymentDetails?.reservationIds || [];

                if (reservationIds.length > 0) {
                    console.log('Decrementing stock for reservations:', reservationIds);

                    const decrementResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stock/decrement`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reservationIds })
                    });

                    if (!decrementResponse.ok) {
                        console.error('Failed to decrement stock:', await decrementResponse.text());
                    } else {
                        console.log('Stock decremented successfully');
                    }
                } else {
                    console.warn('No reservation IDs found in order, cannot decrement stock');
                }
            } catch (error) {
                console.error('Error decrementing stock:', error);
            }
        }

        // Send email if payment approved
        if (shouldSendApprovedEmail) {
            try {
                await sendPaymentApproved({
                    ...updatedOrder,
                    items: updatedOrder.items,
                    customerName: updatedOrder.customerName,
                    customerEmail: updatedOrder.customerEmail || null
                });
            } catch (error) {
                console.error('Error sending payment approved email:', error);
            }
        }

        // Log activity
        await logActivity(
            'payment_update',
            `Pago ${paymentId} actualizado a ${paymentInfo.status} para orden ${order.id}`,
            {
                orderId: order.id,
                paymentId,
                status: paymentInfo.status,
                newOrderStatus: newStatus
            }
        );

        return NextResponse.json({ received: true, processed: true }, { status: 200 });

    } catch (error) {
        console.error('Error processing webhook:', error);
        // Always return 200 to acknowledge receipt, even if processing failed
        return NextResponse.json({ received: true, error: error.message }, { status: 200 });
    }
}
