import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const promotion = await prisma.promotion.findFirst({
            where: {
                name: 'DESCUENTO_TRANSFERENCIA',
                active: true
            },
            select: {
                discountPercentage: true
            }
        });

        const discount = promotion ? promotion.discountPercentage : 20.0; // Default to 20 if not found

        return NextResponse.json({ discount });
    } catch (error) {
        console.error("Error fetching transfer discount:", error);
        return NextResponse.json({ discount: 20.0 }); // Fallback
    }
}
