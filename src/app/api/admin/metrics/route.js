import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get calculated metrics
export async function GET() {
    try {
        // Get all orders
        const orders = await prisma.order.findMany();
        const products = await prisma.product.count();

        // Calculate completed orders and total sales
        const completedOrders = orders.filter(o => o.status === 'Completado');
        const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);

        // Count new orders (Procesando or Pendiente)
        const newOrders = orders.filter(o => o.status === 'Procesando' || o.status === 'Pendiente').length;

        // Get unique customers
        const uniqueCustomers = new Set(orders.map(o => o.customerEmail || o.customerName));

        const metrics = {
            totalSales,
            newOrders,
            totalProducts: products,
            totalCustomers: uniqueCustomers.size,
            totalOrders: orders.length,
            completedOrders: completedOrders.length
        };

        return NextResponse.json(metrics);
    } catch (error) {
        console.error('Error calculating metrics:', error);
        return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 });
    }
}
