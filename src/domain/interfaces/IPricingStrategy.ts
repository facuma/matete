import { Money } from '../value-objects/Money';
import { Product } from '../entities/Product';

export interface PricingContext {
    product: Product;
    quantity: number;
    paymentMethod?: string;
    discountCode?: string;
}

export interface IPricingStrategy {
    calculate(basePrice: Money, context: PricingContext): Money;
    getName(): string;
}
