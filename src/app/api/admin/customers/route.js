import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const customers = await prisma.user.findMany({
            where: {
                role: 'customer'
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                _count: {
                    select: { orders: true }
                },
                orders: {
                    select: {
                        total: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate total billing for each customer
        const customersWithStats = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            createdAt: customer.createdAt,
            orderCount: customer._count.orders,
            totalBilling: customer.orders.reduce((sum, order) => sum + order.total, 0)
        }));

        return NextResponse.json(customersWithStats);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
    }
}
