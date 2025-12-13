import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // 1. Validate State
        const cookieStore = cookies();
        const storedState = cookieStore.get('mp_oauth_state')?.value;

        if (!state || !storedState || state !== storedState) {
            return NextResponse.json({ error: 'Invalid state parameter or CSRF mismatch' }, { status: 400 });
        }

        // Delete state cookie
        cookieStore.delete('mp_oauth_state');

        if (!code) {
            return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
        }

        // 2. Exchange Code for Tokens
        const tokenUrl = 'https://api.mercadopago.com/oauth/token';
        const clientId = process.env.MP_CLIENT_ID;
        const clientSecret = process.env.MP_CLIENT_SECRET;
        const redirectUri = process.env.MP_REDIRECT_URI;

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                client_secret: clientSecret,
                client_id: clientId,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('MP Token Exchange Error:', errorData);
            return NextResponse.json({ error: 'Failed to exchange token', details: errorData }, { status: 500 });
        }

        const data = await response.json();

        // data structure:
        // {
        //   access_token,
        //   token_type,
        //   expires_in,
        //   scope,
        //   user_id,
        //   refresh_token,
        //   public_key,
        //   ...
        // }

        // 3. Save to DB
        await prisma.siteSettings.upsert({
            where: { id: 1 },
            create: { id: 1 },
            update: {
                mpAccessToken: data.access_token,
                mpRefreshToken: data.refresh_token,
                mpPublicKey: data.public_key,
                mpUserId: data.user_id ? BigInt(data.user_id) : undefined,
                // Calculate expiry
                mpExpiresAt: data.expires_in ? new Date(Date.now() + (data.expires_in * 1000)) : null
            }
        });

        // 4. Redirect to Admin
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/admin/settings/payments?connected=1`);

    } catch (error) {
        console.error('Error in MP Callback:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
