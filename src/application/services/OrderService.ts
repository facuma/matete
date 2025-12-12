import { IOrderRepository } from '@/domain/interfaces/Repositories';
import { IProductRepository } from '@/domain/interfaces/Repositories';
import { prisma } from '@/lib/prisma'; // Still needed for transaction if Repository doesn't support it 
// Ideally Repository should expose "withTransaction" or similar, but for now we mix.
import { sendOrderConfirmation } from '@/lib/email';
import { logActivity } from '@/lib/admin-utils';
import { sendPushNotification } from '@/lib/notification-service';

export class OrderService {
    constructor(
        private orderRepository: IOrderRepository,
        private productRepository: IProductRepository
    ) { }

    async createOrder(data: any): Promise<any> {
        // 1. Discount Logic (Move from API)
        if (data.discountCode) {
            const discount = await prisma.discountCode.findUnique({
                where: { code: data.discountCode }
            });

            if (discount) {
                // Validation at Order Creation time to prevent race conditions
                const now = new Date();
                const isExpired = discount.expiresAt && discount.expiresAt < now;
                const isExhausted = discount.usedCount >= discount.usageLimit;

                if (isExpired || isExhausted) {
                    // Decide strategy: Fail order OR Continue without discount?
                    // Failing is safer to avoid user confusion ("Why did I pay full price?")
                    throw new Error(`El código de descuento ${data.discountCode} ya no es válido.`);
                }

                await prisma.discountCode.update({
                    where: { id: discount.id },
                    data: { usedCount: { increment: 1 } }
                });
            }
        }

        // 2. Calculate Status (Move from API)
        let secureStatus = data.status || 'Procesando';
        if (data.paymentMethod === 'transfer') {
            secureStatus = 'Pendiente';
        } else if (data.paymentMethod === 'card') {
            if (data.mercadopagoPaymentId && (data.status === 'Pagado' || data.status === 'approved')) {
                secureStatus = 'Pagado';
            } else {
                secureStatus = 'Procesando';
            }
        }

        // 3. Prepare Data for Repository
        const orderPayload = {
            customerName: data.customer.name,
            customerEmail: data.customer.email || null,
            customerAddress: data.customer.address,
            customerCity: data.customer.city,
            items: data.items,
            total: data.total,
            paymentMethod: data.paymentMethod || 'card',
            paymentDetails: data.paymentDetails || null,
            status: secureStatus,
            shippingMethod: data.shippingMethod || null,
            shippingCost: data.shippingCost || 0,
            mercadopagoPaymentId: data.mercadopagoPaymentId || null,
            mpPaymentStatus: data.mpPaymentStatus || null,
            userId: data.userId, // Passed from controller (secure)
            discountCode: data.discountCode || null
        };

        // 4. Create Order
        // We use direct prisma here if repository abstraction is too leaky for now, OR use repository
        // repository usually returns Domain Entity. API expects JSON.
        // Let's use Prisma directly inside Service for Creation to match current object shape 
        // OR rely on Repository. Let's use Repository.
        const newOrder = await this.orderRepository.create(orderPayload);

        // 5. Stock Management (Transaction Logic)
        // This is complex because it involves Products.
        // Service should coordinate this.
        if (secureStatus === 'Pagado') {
            await this.decrementStock(data.items);
        } else {
            await this.reserveStock(data.items);
        }

        // 6. Side Effects (Email, Logs, Notifications)
        // Log Activity
        try {
            await logActivity('order_created', `Nueva orden pública de ${newOrder.customerName}`, {
                orderId: newOrder.id,
                total: newOrder.total
            });
        } catch (e) {
            console.warn('Failed to log activity', e);
        }

        // Email
        if (newOrder.customerEmail) {
            try {
                // Adapting domain entity back to raw object if needed, or if Entity has same props
                // 'newOrder' is Domain Entity. sendOrderConfirmation expects object with specific props.
                await sendOrderConfirmation(newOrder as any);
            } catch (e) {
                console.error('Email error', e);
            }
        }

        // Push
        try {
            await sendPushNotification(
                '¡Nueva Orden Recibida! 🧉',
                `Pedido #${newOrder.id.slice(0, 8)} por $${newOrder.total} de ${newOrder.customerName}`,
                { orderId: newOrder.id }
            );
        } catch (e) {
            console.error('Push error', e);
        }

        return newOrder;
    }

    // Helper methods for stock
    private async decrementStock(items: any[]) {
        try {
            await prisma.$transaction(async (tx) => {
                for (const item of items) {
                    await tx.product.update({
                        where: { id: item.id },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            });
        } catch (error) {
            console.error('Error decrementing stock:', error);
        }
    }

    private async reserveStock(items: any[]) {
        try {
            await prisma.$transaction(async (tx) => {
                for (const item of items) {
                    await tx.product.update({
                        where: { id: item.id },
                        data: { reservedStock: { increment: item.quantity } }
                    });
                }
            });
        } catch (error) {
            console.error('Error reserving stock:', error);
        }
    }
}
