import { IOrderRepository } from '@/domain/interfaces/Repositories';
import { Order } from '@/domain/entities/Order';
import { prisma } from '@/lib/prisma';
// import { OrderMapper } from '@/infrastructure/mappers/OrderMapper'; // We need this

export class PrismaOrderRepository implements IOrderRepository {
    async create(orderData: any): Promise<Order> {
        // Implementation of create
        // Note: The Domain Interface expects "Order" entity as input/output usually, 
        // but for creation we often pass a DTO or a partial.
        // For now, adhering to the interface which likely says create(order: Order): Promise<Order>
        // But we are moving logic from API route, which constructs data.

        // Actually, the API route does a lot of logic BEFORE creating.
        // The Repository should just save.

        const created = await prisma.order.create({
            data: orderData // We assume orderData is formatted for Prisma 
        });

        // Return Domain Entity
        // return OrderMapper.toDomain(created);
        return new Order(created as any); // Temporary cast until Mapper is consistent
    }

    async findById(id: string): Promise<Order | null> {
        const order = await prisma.order.findUnique({ where: { id } });
        return order ? new Order(order as any) : null;
    }

    // ... update, etc.
    async updateStatus(id: string, status: string): Promise<void> {
        await prisma.order.update({
            where: { id },
            data: { status }
        });
    }

    async findByUser(userId: string): Promise<Order[]> {
        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return orders.map((o: any) => new Order(o));
    }
}
