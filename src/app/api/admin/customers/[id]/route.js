import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const { id } = params;

        const customer = await prisma.user.findUnique({
            where: {
                id: id,
                role: 'customer'
            },
            include: {
                orders: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!customer) {
            return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
        }

        // Calculate total billing
        const totalBilling = customer.orders.reduce((sum, order) => sum + order.total, 0);

        return NextResponse.json({
            ...customer,
            totalBilling,
            orderCount: customer.orders.length
        });
    } catch (error) {
        console.error("Error fetching customer details:", error);
        return NextResponse.json({ error: "Error al obtener detalles del cliente" }, { status: 500 });
    }
}
