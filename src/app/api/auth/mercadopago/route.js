import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function base64url(buffer) {
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function sha256(input) {
    return crypto.createHash("sha256").update(input).digest();
}

export async function POST(request) {
    try {
        // Parse body if exists, for actions
        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            // Body might be empty
        }

        // Action: Disconnect
        if (body.action === "disconnect") {
            await prisma.siteSettings.upsert({
                where: { id: 1 },
                create: { id: 1 },
                update: {
                    mpAccessToken: null,
                    mpRefreshToken: null,
                    mpPublicKey: null,
                    mpUserId: null,
                    mpExpiresAt: null,
                },
            });
            return NextResponse.json({ ok: true, message: "Disconnected successfully" });
        }

        // Action: Connect (Default) -> Generate Auth URL
        const clientId = process.env.MP_CLIENT_ID;
        const redirectUri = process.env.MP_REDIRECT_URI;

        if (!clientId || !redirectUri) {
            return NextResponse.json(
                { error: "Missing MP_CLIENT_ID or MP_REDIRECT_URI env vars" },
                { status: 500 }
            );
        }

        // Generate secure state
        const state = crypto.randomBytes(16).toString("hex");

        // ✅ PKCE: code_verifier + code_challenge (S256)
        const verifier = base64url(crypto.randomBytes(32)); // code_verifier
        const challenge = base64url(sha256(verifier)); // code_challenge

        // Construct URL
        // https://auth.mercadopago.com.ar/authorization?client_id=APP_ID&response_type=code&platform_id=mp&state=...&redirect_uri=...&code_challenge=...&code_challenge_method=S256
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: "code",
            platform_id: "mp",
            state,
            redirect_uri: redirectUri,
            code_challenge: challenge,
            code_challenge_method: "S256",
        });

        const authUrl = `https://auth.mercadopago.com.ar/authorization?${params.toString()}`;

        // Return URL and set cookie for state validation
        const response = NextResponse.json({ url: authUrl });

        const cookieOpts = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 10, // 10 minutes
            path: "/",
        };

        response.cookies.set("mp_oauth_state", state, cookieOpts);

        // ✅ Guardar verifier para el token exchange
        response.cookies.set("mp_oauth_verifier", verifier, cookieOpts);

        return response;
    } catch (error) {
        console.error("Error in MP Auth route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
