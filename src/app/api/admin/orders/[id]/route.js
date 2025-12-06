import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        dni: true,
                        phone: true,
                        address: true,
                        city: true,
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { error: "Pedido no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json(
            { error: "Error al obtener el pedido" },
            { status: 500 }
        );
    }
}
