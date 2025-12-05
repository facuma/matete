import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all shipping options (admin)
export async function GET() {
    try {
        const options = await prisma.shippingOption.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(options);
    } catch (error) {
        console.error('Error fetching shipping options:', error);
        return NextResponse.json({ error: 'Failed to fetch shipping options' }, { status: 500 });
    }
}

// POST - Create new shipping option
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, price, deliveryDays, enabled } = body;

        if (!name || price === undefined || !deliveryDays) {
            return NextResponse.json({
                error: 'Name, price, and deliveryDays are required'
            }, { status: 400 });
        }

        const option = await prisma.shippingOption.create({
            data: {
                name,
                description: description || null,
                price: parseFloat(price),
                deliveryDays,
                enabled: enabled !== undefined ? enabled : true
            }
        });

        return NextResponse.json(option, { status: 201 });
    } catch (error) {
        console.error('Error creating shipping option:', error);
        return NextResponse.json({ error: 'Failed to create shipping option' }, { status: 500 });
    }
}

// PATCH - Update shipping option
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Convert price to float if present
        if (updateData.price !== undefined) {
            updateData.price = parseFloat(updateData.price);
        }

        const option = await prisma.shippingOption.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return NextResponse.json(option);
    } catch (error) {
        console.error('Error updating shipping option:', error);
        return NextResponse.json({ error: 'Failed to update shipping option' }, { status: 500 });
    }
}

// DELETE - Delete shipping option
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.shippingOption.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true, message: 'Shipping option deleted' });
    } catch (error) {
        console.error('Error deleting shipping option:', error);
        return NextResponse.json({ error: 'Failed to delete shipping option' }, { status: 500 });
    }
}
