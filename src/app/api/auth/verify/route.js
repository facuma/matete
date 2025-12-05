import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email y código son requeridos" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { message: "El email ya está verificado" },
                { status: 200 }
            );
        }

        if (user.verificationCode !== code) {
            return NextResponse.json(
                { error: "Código inválido" },
                { status: 400 }
            );
        }

        if (new Date() > new Date(user.verificationCodeExpires)) {
            return NextResponse.json(
                { error: "El código ha expirado" },
                { status: 400 }
            );
        }

        // Verify user
        await prisma.user.update({
            where: { email },
            data: {
                emailVerified: new Date(),
                verificationCode: null,
                verificationCodeExpires: null
            }
        });

        return NextResponse.json(
            { message: "Email verificado exitosamente" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "Error al verificar email" },
            { status: 500 }
        );
    }
}
