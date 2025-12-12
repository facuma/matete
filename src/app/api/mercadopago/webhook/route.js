import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { sendOrderConfirmation, sendPaymentApproved } from '@/lib/email';
import { logActivity } from '@/lib/admin-utils';

// Removed static client initialization
// const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

export async function POST(request) {
    try {
        const body = await request.json();

        console.log('Webhook received:', JSON.stringify(body, null, 2));

        const { type, data } = body;

        if (!type || !data?.id) {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        if (type !== 'payment') {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        const paymentId = data.id;

        // 1. Get Credentials (Single Tenant)
        let accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN; // Fallback

        try {
            const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
            if (settings?.mpAccessToken) {
                accessToken = settings.mpAccessToken;
            }
        } catch (e) {
            console.warn('Error fetching site settings for webhook, using env var');
        }

        // 2. Initialize Client with dynamic token
        const client = new MercadoPagoConfig({ accessToken: accessToken });
        const payment = new Payment(client);

        let paymentInfo;
        try {
            paymentInfo = await payment.get({ id: paymentId });
        } catch (err) {
            console.error('Error fetching payment info:', err);
            // If we can't get payment info (e.g. invalid token), we can't process.
            return NextResponse.json({ received: true, error: 'Failed to fetch payment info' }, { status: 200 });
        }

        console.log('Payment info:', JSON.stringify(paymentInfo, null, 2));

        // 3. Find Order
        // Note: external_reference created in preference matches our order logic?
        // In preference/route.js I set external_reference: `ORDER-${Date.now()}` which is NOT the order ID.
        // But checkout/page.js sets mercadopagoPaymentId manually?
        // Wait. The checkout flow in `checkout/page.js` calls `createOrder` AFTER `handlePaymentSuccess`.
        // BUT the webhook might arrive BEFORE frontend does.
        // And `preference/route.js` sets `external_reference`.
        // The current webhook logic tries to find order by `mercadopagoPaymentId`.

        // If order was created via Frontend after payment, it might have the payment ID.
        // If order doesn't exist yet, we check...

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
            // This is common if webhook arrives before Frontend creates order.
            // We return 200 to acknowledge.
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 4. Update Order Status
        let newStatus = order.status;
        let shouldDecrementStock = false;
        let shouldSendApprovedEmail = false;

        switch (paymentInfo.status) {
            case 'approved':
                if (order.status !== 'Pagado') {
                    newStatus = 'Pagado';
                    shouldDecrementStock = true;
                    shouldSendApprovedEmail = true;
                }
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
                break;
            default:
                console.log('Unknown payment status:', paymentInfo.status);
                break;
        }

        if (newStatus !== order.status) {
            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: newStatus,
                    mpPaymentStatus: paymentInfo.status,
                    mercadopagoPaymentId: paymentId.toString()
                }
            });

            // Decrement Stock
            if (shouldDecrementStock) {
                try {
                    const reservationIds = order.paymentDetails?.reservationIds || [];
                    if (reservationIds.length > 0) {
                        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stock/decrement`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reservationIds })
                        });
                        console.log('Stock decremented successfully');
                    }
                } catch (error) {
                    console.error('Error decrementing stock:', error);
                }
            }

            // Send Email
            if (shouldSendApprovedEmail) {
                try {
                    await sendPaymentApproved({
                        ...updatedOrder,
                        items: updatedOrder.items,
                        customerName: updatedOrder.customerName, // Ensure these fields exist on Order model or object
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
        }

        return NextResponse.json({ received: true, processed: true }, { status: 200 });

    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ received: true, error: error.message }, { status: 200 });
    }
}
