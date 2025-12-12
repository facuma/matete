import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getMpToken } from '@/lib/mercadopago';

export async function POST(request) {
    try {
        const body = await request.json();
        const { items, payer } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        // 1. Get Credentials (Helper handles DB priority + Env fallback + Refresh)
        let accessToken;
        try {
            accessToken = await getMpToken();
        } catch (err) {
            console.error('Failed to get MP token:', err);
            return NextResponse.json({ error: 'Payment configuration missing or invalid' }, { status: 500 });
        }

        // 2. Initialize MP Client
        const client = new MercadoPagoConfig({ accessToken: accessToken });
        const preference = new Preference(client);

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        const result = await preference.create({
            body: {
                items: items.map(item => ({
                    id: String(item.id),
                    title: item.name,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.price),
                    currency_id: 'ARS',
                })),
                payer: {
                    email: payer.email,
                    name: payer.name,
                    identification: {
                        type: "DNI",
                        number: payer.dni
                    },
                    address: {
                        street_name: payer.address?.street_name,
                        city: payer.address?.city,
                    }
                },
                back_urls: {
                    success: `${baseUrl}/checkout/success`,
                    failure: `${baseUrl}/checkout/failure`,
                    pending: `${baseUrl}/checkout/pending`,
                },
                auto_return: 'approved',
                statement_descriptor: "MATETE SHOP",
                external_reference: `ORDER-${Date.now()}`,
                notification_url: `${baseUrl}/api/mercadopago/webhook`,
                payment_methods: {
                    excluded_payment_types: [
                        { id: "ticket" }
                    ],
                    installments: 12
                },
            }
        });

        return NextResponse.json({ id: result.id });
    } catch (error) {
        console.error('Error creating preference:', JSON.stringify(error, null, 2));
        return NextResponse.json({ error: 'Failed to create preference', details: error }, { status: 500 });
    }
}
