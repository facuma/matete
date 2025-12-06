import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from 'jose';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // Only admins via mobile app for now?
        // Prompt said "admin admin" mostly, but let's allow admins only for safety.
        if (user.role !== 'admin') {
            return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });
        }

        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        const token = await new SignJWT({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (e) {
        console.error("Mobile login error:", e);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
