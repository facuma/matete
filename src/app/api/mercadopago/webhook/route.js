import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { sendOrderConfirmation, sendPaymentApproved } from '@/lib/email';
import { logActivity } from '@/lib/admin-utils';
import { getMpToken } from '@/lib/mercadopago';

// Helper for BigInt serialization in logs
const safeStringify = (obj) => {
    return JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
        , 2);
};

export async function POST(request) {
    try {
        const body = await request.json();

        console.log('Webhook received:', safeStringify(body));

        const { type, data } = body;

        // Validation
        if (!type) {
            return NextResponse.json({ received: true, message: 'No type provided' }, { status: 200 });
        }

        // We only care about payment updates for now
        if (type !== 'payment') {
            return NextResponse.json({ received: true, message: 'Ignored non-payment type' }, { status: 200 });
        }

        if (!data?.id) {
            return NextResponse.json({ received: true, message: 'No data.id provided' }, { status: 200 });
        }

        const paymentId = data.id;

        // 1. Get Credentials
        let accessToken;
        try {
            accessToken = await getMpToken();
        } catch (e) {
            console.error('Error fetching MP token for webhook:', e);
            // Return 500 so MP retries later when we fix the config
            return NextResponse.json({ received: true, error: 'Token configuration error: ' + e.message }, { status: 500 });
        }

        // 2. Initialize Client
        const client = new MercadoPagoConfig({ accessToken: accessToken });
        const payment = new Payment(client);

        let paymentInfo;
        try {
            paymentInfo = await payment.get({ id: paymentId });
        } catch (err) {
            console.error('Error fetching payment info from MP:', err);
            // If the token is invalid or MP is down
            return NextResponse.json({ received: true, error: 'Failed to fetch payment info from MercadoPago' }, { status: 500 });
        }

        console.log('Payment info fetched:', safeStringify(paymentInfo));

        // 3. Find Order
        // Search by mercadopagoPaymentId OR paymentDetails matches
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { mercadopagoPaymentId: paymentId.toString() },
                    // Check if it's in the JSON paymentDetails
                    {
                        paymentDetails: {
                            path: ['paymentId'],
                            equals: paymentId.toString()
                        }
                    },
                    // Also check external_reference if available
                    paymentInfo.external_reference ? {
                        id: paymentInfo.external_reference // assumes external_reference IS the order ID
                    } : undefined
                ].filter(Boolean) // Remove undefined
            }
        });

        if (!order) {
            console.log('Order not found for payment ID:', paymentId);
            // Return 200 because if we don't have the order, retrying probably won't help unless the order creation is delayed.
            // If it IS delayed, 500/429 might be better, but standard practice is 200 if not found to avoid queue clogging, 
            // unless we are sure it's a race condition.
            // For now, return 200.
            return NextResponse.json({ received: true, message: 'Order not found' }, { status: 200 });
        }

        // 4. Update Order Status
        let newStatus = order.status;
        let shouldDecrementStock = false;
        let shouldSendApprovedEmail = false;

        const mpStatus = paymentInfo.status;
        const mpStatusDetail = paymentInfo.status_detail;

        console.log(`Processing Order ${order.id}. Current Status: ${order.status}. MP Status: ${mpStatus}`);

        switch (mpStatus) {
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
                if (order.status !== 'Pagado' && order.status !== 'Cancelado') {
                    newStatus = 'Pendiente'; // Or keep 'Procesando'
                }
                break;
            case 'rejected':
            case 'cancelled':
            case 'refunded':
            case 'charged_back':
                if (order.status !== 'Pagado') {
                    newStatus = 'Cancelado';
                }
                break;
            default:
                console.log('Unknown payment status:', mpStatus);
                break;
        }

        if (newStatus !== order.status || order.mercadopagoPaymentId !== paymentId.toString()) {
            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: newStatus,
                    mpPaymentStatus: mpStatus,
                    mercadopagoPaymentId: paymentId.toString(),
                    updatedAt: new Date() // Force update time
                }
            });

            // Decrement Stock
            if (shouldDecrementStock) {
                try {
                    // Logic to decrement stock
                    // Check if we have a decrement stock helper or API
                    // The logic in previous reading called an API endpoint.
                    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                    /* 
                       Calling own API from webhook is risky if auth needed or network issues. 
                       Ideally, call a controller function directly.
                       But reusing existing API call logic:
                    */
                    const reservationIds = order.paymentDetails?.reservationIds || [];
                    if (reservationIds.length > 0) {
                        try {
                            await fetch(`${baseUrl}/api/stock/decrement`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reservationIds })
                            });
                            console.log('Stock decremented trigger sent.');
                        } catch (err) {
                            console.error("Failed to trigger stock decrement API", err);
                        }
                    }
                } catch (error) {
                    console.error('Error decrementing stock logic:', error);
                }
            }

            // Send Email
            if (shouldSendApprovedEmail) {
                try {
                    await sendPaymentApproved({
                        ...updatedOrder,
                        items: updatedOrder.items,
                        customerName: updatedOrder.customerName,
                        customerEmail: updatedOrder.customerEmail
                    });
                    console.log('Payment approved email sent.');
                } catch (error) {
                    console.error('Error sending payment approved email:', error);
                }
            }

            // Log activity
            try {
                await logActivity(
                    'payment_update',
                    `Pago ${paymentId} actualizado a ${mpStatus} para orden ${order.id}`,
                    {
                        orderId: order.id,
                        paymentId,
                        status: mpStatus,
                        newOrderStatus: newStatus
                    }
                );
            } catch (e) { console.error('Log activity failed', e) }
        }

        return NextResponse.json({ received: true, processed: true }, { status: 200 });

    } catch (error) {
        console.error('CRITICAL Error processing webhook:', error);
        return NextResponse.json({
            received: true,
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
