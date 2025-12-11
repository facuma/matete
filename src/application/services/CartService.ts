import { Product } from '@/domain/entities/Product';
import { CartItem } from '@/domain/entities/CartItem';
import { Money } from '@/domain/value-objects/Money';
import { PricingService } from './PricingService';

// This implementation currently runs client-side mostly, mimicking the old context but in a Service class.
// Ideally, this would persist to DB/Redis via a repository.

export class CartService {
    private cartItems: CartItem[] = [];
    private pricingService: PricingService;

    constructor(pricingService: PricingService) {
        this.pricingService = pricingService;
    }

    // In a real app, this would be async fetching from storage
    getItems(): CartItem[] {
        return this.cartItems;
    }

    addItem(product: Product, quantity: number = 1, options: Record<string, any> = {}): void {
        const existingItem = this.cartItems.find(
            item => item.product.id === product.id &&
                JSON.stringify(item.selectedOptions) === JSON.stringify(options)
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cartItems.push(new CartItem(product, quantity, options));
        }
        this.persist();
    }

    removeItem(cartItemId: string): void {
        this.cartItems = this.cartItems.filter(item => item.id !== cartItemId);
        this.persist();
    }

    updateQuantity(cartItemId: string, quantity: number): void {
        const item = this.cartItems.find(i => i.id === cartItemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(cartItemId);
            } else {
                item.quantity = quantity;
            }
        }
        this.persist();
    }

    clear(): void {
        this.cartItems = [];
        this.persist();
    }

    getTotals() {
        let subtotal = new Money(0);
        let total = new Money(0);

        this.cartItems.forEach(item => {
            // Use Pricing Service for accurate calculation including promotions
            const itemTotal = this.pricingService.calculatePrice(item.product, item.quantity);
            total = total.add(itemTotal);

            // Assuming subtotal is without "special" discounts, but keep simple for now
            subtotal = subtotal.add(item.product.price.multiply(item.quantity));
        });

        return {
            subtotal,
            total,
            count: this.cartItems.reduce((acc, item) => acc + item.quantity, 0)
        };
    }

    // Helper to sync with localStorage (Adapter pattern opportunity here later)
    setItems(items: CartItem[]) {
        this.cartItems = items;
    }

    private persist() {
        // Since this is a service class running in memory, 
        // the Persistence responsibility usually belongs to a Repository or Controller.
        // For the Client-side Refactor, the Context will subscribe to this service and handle React state/LocalStorage.
    }
}
