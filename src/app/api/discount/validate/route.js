import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Código requerido" }, { status: 400 });
        }

        const discount = await prisma.discountCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!discount) {
            return NextResponse.json({ error: "Código inválido" }, { status: 404 });
        }

        if (discount.usedCount >= discount.usageLimit) {
            return NextResponse.json({ error: "El código ha alcanzado su límite de uso" }, { status: 400 });
        }

        if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
            return NextResponse.json({ error: "El código ha expirado" }, { status: 400 });
        }

        return NextResponse.json({
            code: discount.code,
            percentage: discount.percentage,
        });
    } catch (error) {
        console.error("Error validating discount:", error);
        return NextResponse.json({ error: "Error al validar el código" }, { status: 500 });
    }
}
