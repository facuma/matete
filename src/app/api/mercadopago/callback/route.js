import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request) {
    try {
        const code = request.nextUrl.searchParams.get("code");
        const state = request.nextUrl.searchParams.get("state");
        const error = request.nextUrl.searchParams.get("error");

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
        const cookieStore = cookies();
        const storedState = cookieStore.get("mp_oauth_state")?.value;
        const verifier = cookieStore.get("mp_oauth_verifier")?.value;

        if (!state || !storedState || state !== storedState) {
            return NextResponse.json({ error: "Invalid state" }, { status: 400 });
        }

        if (!verifier) {
            return NextResponse.json({ error: "Missing PKCE verifier" }, { status: 400 });
        }

        // limpiar cookies
        cookieStore.set("mp_oauth_state", "", { path: "/", maxAge: 0 });
        cookieStore.set("mp_oauth_verifier", "", { path: "/", maxAge: 0 });

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

        return NextResponse.redirect(`${baseUrl}/admin/settings/payments?status=connected`);
    } catch (err) {
        console.error("OAuth Callback Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}