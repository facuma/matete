import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

export async function POST(request) {
    try {
        const body = await request.json();
        const payment = new Payment(client);

        const result = await payment.create({ body });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json({ error: 'Error processing payment', details: error }, { status: 500 });
    }
}
