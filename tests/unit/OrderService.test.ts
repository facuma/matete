import { OrderService } from '../../src/application/services/OrderService';
import { IOrderRepository, IProductRepository } from '../../src/domain/interfaces/Repositories';
import { Order } from '../../src/domain/entities/Order';
import { Product } from '../../src/domain/entities/Product';
import { Money } from '../../src/domain/value-objects/Money';

// Mock side effects
jest.mock('../../src/lib/notification-service', () => ({
    sendPushNotification: jest.fn().mockResolvedValue({ success: true })
}));
jest.mock('../../src/lib/email', () => ({
    sendOrderConfirmation: jest.fn().mockResolvedValue({ success: true })
}));
jest.mock('../../src/lib/admin-utils', () => ({
    logActivity: jest.fn().mockResolvedValue(true)
}));
jest.mock('../../src/lib/prisma', () => ({
    prisma: {
        discountCode: {
            findUnique: jest.fn(),
            update: jest.fn()
        },
        product: {
            update: jest.fn()
        },
        $transaction: jest.fn((callback) => callback({
            product: { update: jest.fn() }
        }))
    }
}));

// Mocks
const mockOrderRepository: jest.Mocked<IOrderRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    findByUser: jest.fn(),
} as any;

const mockProductRepository: jest.Mocked<IProductRepository> = {
    findById: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    findByCategory: jest.fn(),
} as any;

describe('OrderService', () => {
    let orderService: OrderService;

    beforeEach(() => {
        jest.clearAllMocks();
        orderService = new OrderService(mockOrderRepository, mockProductRepository);
    });

    it('should create an order successfully', async () => {
        const orderData = {
            customer: {
                name: 'Test Customer',
                email: 'test@example.com',
                address: '123 Test St',
                city: 'Test City'
            },
            items: [],
            total: 1000,
            paymentMethod: 'card'
        };

        const expectedOrder = new Order({
            id: '123',
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            items: [],
            total: new Money(1000),
            status: 'Procesando',
            createdAt: new Date(),
            paymentMethod: 'card'
        });

        mockOrderRepository.create.mockResolvedValue(expectedOrder);

        const result = await orderService.createOrder(orderData);

        expect(mockOrderRepository.create).toHaveBeenCalled();
        expect(result).toEqual(expectedOrder);
    });
});
