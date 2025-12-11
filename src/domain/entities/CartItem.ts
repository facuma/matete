import { Product } from './Product';
import { Money } from '../value-objects/Money';

export class CartItem {
    id: string; // Cart Item unique ID (random or db)
    product: Product;
    quantity: number;
    selectedOptions: Record<string, any>;

    constructor(product: Product, quantity: number, selectedOptions: Record<string, any> = {}) {
        this.id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.product = product;
        this.quantity = quantity;
        this.selectedOptions = selectedOptions;
    }

    // You might add logic here to calculate price with options
    get total(): Money {
        return this.product.price.multiply(this.quantity);
    }
}
