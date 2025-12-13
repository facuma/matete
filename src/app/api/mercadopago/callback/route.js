import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request) {
    try {
        // 1. Parsing - Use standard URL parsing for maximum compatibility
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
            return NextResponse.json(
                { error: "Mercado Pago authorization failed", details: error },
                { status: 400 }
            );
        }

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        // 🔐 Validar state + PKCE verifier
        const cookieStore = await cookies();
        const storedState = cookieStore.get("mp_oauth_state")?.value;
        const verifier = cookieStore.get("mp_oauth_verifier")?.value;

        if (!state || !storedState || state !== storedState) {
            return NextResponse.json({ error: "Invalid state" }, { status: 400 });
        }

        if (!verifier) {
            return NextResponse.json({ error: "Missing PKCE verifier" }, { status: 400 });
        }

        // limpiar cookies
        // We will clear cookies on the response object later

        // 🔑 env vars correctas
        const clientId = process.env.MP_CLIENT_ID;
        const clientSecret = process.env.MP_CLIENT_SECRET;
        const redirectUri = process.env.MP_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            return NextResponse.json({ error: "Missing MP env vars" }, { status: 500 });
        }

        // 🔁 Token exchange (FORM + PKCE)
        const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                code_verifier: verifier,
            }),
        });

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("MP Token Error:", data);
            return NextResponse.json({ error: "Token exchange failed", details: data }, { status: 500 });
        }

        const expiresAt = data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000)
            : null;

        await prisma.siteSettings.upsert({
            where: { id: 1 },
            create: { id: 1 },
            update: {
                mpAccessToken: data.access_token ?? null,
                mpRefreshToken: data.refresh_token ?? null,
                mpPublicKey: data.public_key ?? null,
                mpUserId: data.user_id ? BigInt(data.user_id) : null,
                mpExpiresAt: expiresAt,
            },
        });

        const baseUrl =
            process.env.APP_BASE_URL ||
            process.env.NEXTAUTH_URL ||
            request.headers.get("origin") ||
            "http://localhost:3000";

        const nextResponse = NextResponse.redirect(`${baseUrl}/admin/settings/payments?status=connected`);

        // Correctly delete cookies on the response
        nextResponse.cookies.delete('mp_oauth_state');
        nextResponse.cookies.delete('mp_oauth_verifier');

        return nextResponse;
    } catch (err) {
        console.error("OAuth Callback Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}