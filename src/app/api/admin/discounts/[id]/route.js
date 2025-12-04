import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await prisma.discountCode.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting discount:", error);
        return NextResponse.json({ error: "Error deleting discount" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { code, percentage, usageLimit, expiresAt } = body;

        // Basic validation (can be enhanced with Zod)
        if (!code || !percentage || !usageLimit) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        const updatedDiscount = await prisma.discountCode.update({
            where: { id: parseInt(id) },
            data: {
                code,
                percentage,
                usageLimit,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        });

        return NextResponse.json(updatedDiscount);
    } catch (error) {
        console.error("Error updating discount:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "El código ya existe" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error updating discount" }, { status: 500 });
    }
}
