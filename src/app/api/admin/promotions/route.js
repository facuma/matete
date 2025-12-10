import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const promotions = await prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        return NextResponse.json(promotions);
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return NextResponse.json({ error: "Error fetching promotions" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, discountPercentage, startDate, endDate, active, scope, productIds } = body;

        // Basic validation
        if (!name || discountPercentage === undefined || !startDate) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        // Use transaction to create promo and update products
        const promotion = await prisma.$transaction(async (tx) => {
            const newPromo = await tx.promotion.create({
                data: {
                    name,
                    description,
                    discountPercentage: parseFloat(discountPercentage),
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    active: active ?? true,
                },
            });

            if (scope === 'all') {
                // Apply to all products
                await tx.product.updateMany({
                    data: { promotionId: newPromo.id }
                });
            } else if (scope === 'specific' && Array.isArray(productIds) && productIds.length > 0) {
                // Apply to specific products
                await tx.product.updateMany({
                    where: { id: { in: productIds } },
                    data: { promotionId: newPromo.id }
                });
            }

            return newPromo;
        });

        return NextResponse.json(promotion, { status: 201 });
    } catch (error) {
        console.error("Error creating promotion:", error);
        return NextResponse.json({ error: "Error creating promotion" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, name, description, discountPercentage, startDate, endDate, active, scope, productIds } = body;

        // Basic validation
        if (!id || !name || discountPercentage === undefined || !startDate) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        // Use transaction to update promo and products
        const promotion = await prisma.$transaction(async (tx) => {
            const updatedPromo = await tx.promotion.update({
                where: { id },
                data: {
                    name,
                    description,
                    discountPercentage: parseFloat(discountPercentage),
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    active: active ?? true,
                },
            });

            // Reset existing links
            await tx.product.updateMany({
                where: { promotionId: id },
                data: { promotionId: null }
            });

            // Apply new links
            if (scope === 'all') {
                await tx.product.updateMany({
                    data: { promotionId: id }
                });
            } else if (scope === 'specific' && Array.isArray(productIds) && productIds.length > 0) {
                await tx.product.updateMany({
                    where: { id: { in: productIds } },
                    data: { promotionId: id }
                });
            }

            return updatedPromo;
        });

        return NextResponse.json(promotion);
    } catch (error) {
        console.error("Error updating promotion:", error);
        return NextResponse.json({ error: "Error updating promotion" }, { status: 500 });
    }
}
