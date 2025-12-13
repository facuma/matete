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
    // ALWAYS return 200 OK at the end. catch(...) must ensure this.
    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        // 1. Parsing Context (Query + Body)
        const queryId = searchParams.get('id') || searchParams.get('data.id');
        const queryTopic = searchParams.get('topic') || searchParams.get('type');

        // Safe Body Parsing
        let body = null;
        try {
            const text = await request.text();
            if (text && text.trim().length > 0) {
                body = JSON.parse(text);
            }
        } catch (e) {
            console.warn('[MP Notify] Body parsing failed or empty. Relying on Query Params.');
            // Body stays null
        }

        // 2. Identify Payment ID
        // Strategies: 
        // A) Query Param "id" (Classic IPN)
        // B) Body "data.id" (Webhook V1)
        // C) Body "id" (Simple Webhook)
        const paymentId = queryId || body?.data?.id || body?.id;
        const type = queryTopic || body?.type || body?.topic;

        console.log(`[MP Notify] Hit. ID=${paymentId}, Type=${type}. Params=${searchParams.toString()}`);

        // 3. Early Exit Conditions
        if (!paymentId) {
            console.log('[MP Notify] No ID found in request. Ignoring.');
            return NextResponse.json({ status: 'OK', message: 'No ID' }, { status: 200 });
        }

        // Test Notification Check
        if (String(paymentId) === '123456') {
            console.log('[MP Notify] MP test notification ignored (ID 123456).');
            return NextResponse.json({ status: 'OK', message: 'Test notification ignored' }, { status: 200 });
        }

        // 4. Process Payment (Encapsulated)
        // We use a separate block/function concept here (inline for simplicity but isolated scope)
        await (async () => {
            try {
                // Get Credentials
                const accessToken = await getMpToken();
                if (!accessToken) throw new Error('No MP Access Token configured');

                // Fetch Payment Info
                const client = new MercadoPagoConfig({ accessToken });
                const payment = new Payment(client);

                const paymentInfo = await payment.get({ id: paymentId });
                console.log(`[MP Notify] Payment fetched. Status: ${paymentInfo.status}`);

                // Find Order
                const order = await prisma.order.findFirst({
                    where: {
                        OR: [
                            { mercadopagoPaymentId: String(paymentId) },
                            { paymentDetails: { path: ['paymentId'], equals: String(paymentId) } },
                            paymentInfo.external_reference ? { id: paymentInfo.external_reference } : undefined
                        ].filter(Boolean)
                    }
                });

                if (!order) {
                    console.log(`[MP Notify] Order not found for Payment ID ${paymentId}`);
                    // Check idempotency/late arrival? 
                    // For now, acceptable to just return.
                    return;
                }

                // Update Status Logic
                let newStatus = order.status;
                let shouldDecrementStock = false;
                let shouldSendApprovedEmail = false;
                const mpStatus = paymentInfo.status;

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
                            newStatus = 'Pendiente';
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
                }

                // Check if update needed
                if (newStatus !== order.status || order.mercadopagoPaymentId !== String(paymentId)) {
                    const updatedOrder = await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            status: newStatus,
                            mpPaymentStatus: mpStatus,
                            mercadopagoPaymentId: String(paymentId),
                            updatedAt: new Date()
                        }
                    });
                    console.log(`[MP Notify] Order ${order.id} updated -> ${newStatus}`);

                    // Action: Stock
                    if (shouldDecrementStock) {
                        try {
                            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                            const reservationIds = order.paymentDetails?.reservationIds || [];
                            if (reservationIds.length > 0) {
                                // Fire and forget (or await check)
                                const stockRes = await fetch(`${baseUrl}/api/stock/decrement`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reservationIds })
                                });
                                if (!stockRes.ok) console.error('Stock decrement API failed');
                            }
                        } catch (err) { console.error('Stock logic error', err); }
                    }

                    // Action: Email
                    if (shouldSendApprovedEmail) {
                        try {
                            await sendPaymentApproved({
                                ...updatedOrder,
                                items: updatedOrder.items,
                                customerName: updatedOrder.customerName,
                                customerEmail: updatedOrder.customerEmail
                            });
                        } catch (err) { console.error('Email sending error', err); }
                    }

                    // Action: Log
                    try {
                        await logActivity('payment_update', `Pago ${paymentId} -> ${mpStatus}`, {
                            orderId: order.id,
                            paymentId,
                            status: mpStatus
                        });
                    } catch (e) { /* ignore */ }
                } else {
                    console.log(`[MP Notify] No status change for Order ${order.id}`);
                }

            } catch (innerError) {
                console.error('[MP Notify] Process Logic Error:', innerError.message);
                // Intentionally swallowed to ensure 200 OK
            }
        })();

        // 5. Success Response
        return NextResponse.json({ status: 'OK' }, { status: 200 });

    } catch (criticalError) {
        console.error('[MP Notify] HTTP Wrapper Critical Error:', criticalError);
        // Absolute fail-safe
        return NextResponse.json({ status: 'OK', error: 'Wrapper Error' }, { status: 200 });
    }
}

export async function GET(request) {
    // Some IPN implementations might probe with GET
    console.log('[MP Notify] GET received. Returning 200.');
    return NextResponse.json({ status: 'OK' }, { status: 200 });
}
