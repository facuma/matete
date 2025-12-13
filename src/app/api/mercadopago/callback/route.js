import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        // 1. Parsing - Use standard URL parsing for maximum compatibility
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        // 2. Validate State (CSRF)
        const cookieStore = await cookies();
        const storedState = cookieStore.get('mp_oauth_state')?.value;

        if (!code) {
            return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
        }

        if (!state || !storedState || state !== storedState) {
            return NextResponse.json({ error: 'Invalid state parameter or CSRF mismatch' }, { status: 400 });
        }

        // 3. Exchange Code for Tokens
        const tokenUrl = 'https://api.mercadopago.com/oauth/token';
        const clientId = process.env.MP_CLIENT_ID;
        const clientSecret = process.env.MP_CLIENT_SECRET;
        const redirectUri = process.env.MP_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            console.error('Missing Env Vars for MP OAuth');
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
        }

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

        // Robust JSON parsing
        let data;
        const raw = await response.text();
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse MP response:', raw);
            data = { error: 'Invalid JSON from MP', raw };
        }

        if (!response.ok) {
            console.error('MP Token Exchange Error:', data);
            return NextResponse.json({ error: 'Failed to exchange token', details: data }, { status: 500 });
        }

        // 4. Save to DB
        await prisma.siteSettings.upsert({
            where: { id: 1 },
            create: { id: 1 },
            update: {
                mpAccessToken: data.access_token,
                mpRefreshToken: data.refresh_token,
                mpPublicKey: data.public_key,
                mpUserId: data.user_id ? BigInt(data.user_id) : undefined,
                mpExpiresAt: data.expires_in ? new Date(Date.now() + (data.expires_in * 1000)) : null
            }
        });

        // 5. Redirect and Clear Cookie
        const baseUrl = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

        // Create response object to modify cookies
        const nextResponse = NextResponse.redirect(`${baseUrl}/admin/settings/payments?connected=1`);

        // Correctly delete cookie on the response
        nextResponse.cookies.delete('mp_oauth_state');

        return nextResponse;

    } catch (error) {
        console.error('Error in MP Callback:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
