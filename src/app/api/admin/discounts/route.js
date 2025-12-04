import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { discountCodeSchema } from "./validation";

export async function GET() {
    try {
        const discounts = await prisma.discountCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(discounts);
    } catch (error) {
        console.error("Error fetching discounts:", error);
        return NextResponse.json({ error: "Error fetching discounts" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const validation = discountCodeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors }, { status: 400 });
        }

        const { code, percentage, usageLimit, expiresAt } = validation.data;

        const discount = await prisma.discountCode.create({
            data: {
                code,
                percentage,
                usageLimit,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        });

        return NextResponse.json(discount, { status: 201 });
    } catch (error) {
        console.error("Error creating discount:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "El código ya existe" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error creating discount" }, { status: 500 });
    }
}
