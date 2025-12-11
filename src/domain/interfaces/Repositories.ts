import { Product } from '../entities/Product';
import { Order } from '../entities/Order';

export interface IProductRepository {
    findAll(filters?: any): Promise<Product[]>;
    findById(id: number): Promise<Product | null>;
    findBySlug(slug: string): Promise<Product | null>;
    updateStock(id: number, quantity: number): Promise<void>;
}

export interface IOrderRepository {
    create(orderData: any): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findByUser(userId: string): Promise<Order[]>;
}
