import { PricingService } from '@/application/services/PricingService';
import { CartService } from '@/application/services/CartService';
import { IOrderRepository, IProductRepository } from '@/domain/interfaces/Repositories';
import { PrismaOrderRepository } from '@/infrastructure/repositories/PrismaOrderRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/PrismaProductRepository';
import { OrderService } from '@/application/services/OrderService';

export class ServiceFactory {
    private static pricingService: PricingService;
    private static cartService: CartService;
    private static productRepository: IProductRepository;
    private static orderRepository: IOrderRepository;
    private static orderService: OrderService;

    static getPricingService(): PricingService {
        if (!this.pricingService) {
            this.pricingService = new PricingService();
        }
        return this.pricingService;
    }

    static getCartService(): CartService {
        if (!this.cartService) {
            this.cartService = new CartService(this.getPricingService());
        }
        return this.cartService;
    }

    static getProductRepository(): IProductRepository {
        if (!this.productRepository) {
            this.productRepository = new PrismaProductRepository();
        }
        return this.productRepository;
    }

    static getOrderRepository(): IOrderRepository {
        if (!this.orderRepository) {
            this.orderRepository = new PrismaOrderRepository();
        }
        return this.orderRepository;
    }

    static getOrderService(): OrderService {
        if (!this.orderService) {
            this.orderService = new OrderService(
                this.getOrderRepository(),
                this.getProductRepository()
            );
        }
        return this.orderService;
    }
}
