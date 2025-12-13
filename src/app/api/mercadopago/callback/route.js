import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request) {
    try {
        // ✅ Forma más robusta en Next App Router
        const code = request.nextUrl.searchParams.get("code");
        const state = request.nextUrl.searchParams.get("state");

        // 1) Validate state (CSRF)
        const cookieStore = cookies();
        const storedState = cookieStore.get("mp_oauth_state")?.value;

        if (!code) {
            return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
        }

        if (!state || !storedState || state !== storedState) {
            return NextResponse.json(
                { error: "Invalid state parameter or CSRF mismatch" },
                { status: 400 }
            );
        }

        // ✅ Borrar cookie de forma segura (en vez de delete)
        cookieStore.set("mp_oauth_state", "", { path: "/", maxAge: 0 });

        // 2) Exchange code for tokens
        const tokenUrl = "https://api.mercadopago.com/oauth/token";
        const clientId = process.env.MP_CLIENT_ID;
        const clientSecret = process.env.MP_CLIENT_SECRET;
        const redirectUri = process.env.MP_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            return NextResponse.json(
                { error: "Missing MP env vars", details: { clientId: !!clientId, clientSecret: !!clientSecret, redirectUri: !!redirectUri } },
                { status: 500 }
            );
        }

        const response = await fetch(tokenUrl, {
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
            }),
        });

        const raw = await response.text();
        let data;
        try {
            data = raw ? JSON.parse(raw) : null;
        } catch {
            data = { raw };
        }

        if (!response.ok) {
            console.error("MP Token Exchange Error:", data);
            return NextResponse.json(
                { error: "Failed to exchange token", details: data },
                { status: 500 }
            );
        }

        // 3) Save to DB
        await prisma.siteSettings.upsert({
            where: { id: 1 },
            create: { id: 1 },
            update: {
                mpAccessToken: data.access_token ?? null,
                mpRefreshToken: data.refresh_token ?? null,
                mpPublicKey: data.public_key ?? null,
                mpUserId: data.user_id ? BigInt(data.user_id) : null,
                mpExpiresAt: data.expires_in
                    ? new Date(Date.now() + data.expires_in * 1000)
                    : null,
            },
        });

        // 4) Redirect to admin (✅ preferí APP_BASE_URL / NEXT_PUBLIC_... si tenés)
        const baseUrl =
            process.env.APP_BASE_URL ||
            process.env.NEXTAUTH_URL ||
            "http://localhost:3000";

        return NextResponse.redirect(`${baseUrl}/admin/settings/payments?connected=1`);
    } catch (error) {
        console.error("Error in MP Callback:", error);
        return NextResponse.json(
            { error: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
