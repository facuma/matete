import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error: 'Mercado Pago authorization failed', details: error }, { status: 400 });
    }

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const redirectUri = `${process.env.NEXTAUTH_URL || request.headers.get('origin')}/api/auth/mercadopago/callback`;

    try {
        const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
                client_id: process.env.MERCADOPAGO_APP_ID,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
            }),
        });

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('MP Token Error:', data);
            return NextResponse.json({ error: 'Failed to exchange token', details: data }, { status: 500 });
        }

        // data = { access_token, refresh_token, public_key, user_id, expires_in, ... }

        const expiresAt = new Date(Date.now() + (data.expires_in * 1000));

        // Update Global Site Settings (ID 1)
        await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: {
                mpAccessToken: data.access_token,
                mpRefreshToken: data.refresh_token,
                mpPublicKey: data.public_key,
                mpUserId: BigInt(data.user_id),
                mpExpiresAt: expiresAt,
            },
            create: {
                id: 1,
                mpAccessToken: data.access_token,
                mpRefreshToken: data.refresh_token,
                mpPublicKey: data.public_key,
                mpUserId: BigInt(data.user_id),
                mpExpiresAt: expiresAt,
            },
        });

        // Redirect back to admin panel
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL || request.headers.get('origin')}/admin/settings/payments?status=connected`);

    } catch (error) {
        console.error('OAuth Callback Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
