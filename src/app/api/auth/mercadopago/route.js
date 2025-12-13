import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
    try {
        // Parse body if exists, for actions
        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            // Body might be empty if just hitting the endpoint for auth url, 
            // but usually we expect a button click.
            // If empty, proceed to auth init.
        }

        // Action: Disconnect
        if (body.action === 'disconnect') {
            await prisma.siteSettings.upsert({
                where: { id: 1 },
                create: { id: 1 }, // Should not happen if app is running
                update: {
                    mpAccessToken: null,
                    mpRefreshToken: null,
                    mpPublicKey: null, // If we were using it
                    mpUserId: null,
                    mpExpiresAt: null
                }
            });
            return NextResponse.json({ ok: true, message: 'Disconnected successfully' });
        }

        // Action: Connect (Default) -> Generate Auth URL
        const clientId = process.env.MP_CLIENT_ID;
        const redirectUri = process.env.MP_REDIRECT_URI; // e.g., https://yourdomain.com/api/mercadopago/callback

        if (!clientId || !redirectUri) {
            return NextResponse.json({ error: 'Missing MP_CLIENT_ID or MP_REDIRECT_URI env vars' }, { status: 500 });
        }

        // Generate secure state
        const state = crypto.randomBytes(16).toString('hex');

        // Construct URL
        // https://auth.mercadopago.com/authorization?client_id=APP_ID&response_type=code&platform_id=mp&state=RANDOM_ID&redirect_uri=HTTP://URL
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            platform_id: 'mp',
            state: state,
            redirect_uri: redirectUri
        });

        const authUrl = `https://auth.mercadopago.com.ar/authorization?${params.toString()}`;

        // Return URL and set cookie for state validation
        const response = NextResponse.json({ url: authUrl });

        // precise cookie options
        response.cookies.set('mp_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Error in MP Auth route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
