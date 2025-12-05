import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const { name, email, password, dni, phone, address, city } = await request.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Todos los campos son requeridos" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "La contraseña debe tener al menos 8 caracteres" },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "El email ya está registrado" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "customer",
                dni,
                phone,
                address,
                city,
                verificationCode,
                verificationCodeExpires,
                emailVerified: null // Explicitly null
            }
        });

        // Send verification email
        const { sendVerificationEmail } = await import("@/lib/email");
        await sendVerificationEmail({
            to: email,
            name,
            code: verificationCode
        });

        return NextResponse.json(
            {
                message: "Usuario creado. Por favor verifica tu email.",
                requireVerification: true,
                email: user.email
            },
            { status: 201 }
        );

        return NextResponse.json(
            {
                message: "Usuario creado exitosamente",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Error al crear usuario" },
            { status: 500 }
        );
    }
}
