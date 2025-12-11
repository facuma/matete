import { NextResponse } from 'next/server';
import { ServiceFactory } from '@/infrastructure/factories/ServiceFactory';

// POST - Create new order (Public)
export async function POST(request) {
    try {
        const body = await request.json();

        // Secure userId assignment (Controller Responsibility)
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
        const session = await getServerSession(authOptions);

        // If user is logged in, attach order to them.
        const secureUserId = session?.user?.id || null;

        const orderService = ServiceFactory.getOrderService();

        // Delegate business logic to Service
        // We pass body + secureUserId override
        const newOrder = await orderService.createOrder({
            ...body,
            userId: secureUserId // Override any spoofed userId
        });

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
    }
}
