import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

export async function POST(request) {
    try {
        const body = await request.json();
        const { items, payer } = body;

        const preference = new Preference(client);

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
                    success: 'https://00a44bb49a38.ngrok-free.app/checkout/success',
                    failure: 'https://00a44bb49a38.ngrok-free.app/checkout/failure',
                    pending: 'https://00a44bb49a38.ngrok-free.app/checkout/pending',
                },
                auto_return: 'approved',
                statement_descriptor: "MATETE SHOP",
                external_reference: `ORDER-${Date.now()}`, // Unique reference
                notification_url: "https://00a44bb49a38.ngrok-free.app/api/mercadopago/webhook",
                payment_methods: {
                    excluded_payment_types: [
                        { id: "ticket" } // Exclude cash payments (PagoFácil/Rapipago) for instant approval
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
