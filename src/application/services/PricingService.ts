import { Product } from '@/domain/entities/Product';
import { Money } from '@/domain/value-objects/Money';
import { IPricingStrategy, PricingContext } from '@/domain/interfaces/IPricingStrategy';
import { RegularPricingStrategy } from '@/domain/strategies/pricing/RegularPricingStrategy';
import { PromotionalPricingStrategy } from '@/domain/strategies/pricing/PromotionalPricingStrategy';
import { TransferPricingStrategy } from '@/domain/strategies/pricing/TransferPricingStrategy';

export class PricingService {
    private strategies: Map<string, IPricingStrategy>;

    constructor() {
        this.strategies = new Map();
        this.registerStrategy('regular', new RegularPricingStrategy());
        this.registerStrategy('promotional', new PromotionalPricingStrategy());
        this.registerStrategy('transfer', new TransferPricingStrategy());
    }

    registerStrategy(name: string, strategy: IPricingStrategy) {
        this.strategies.set(name, strategy);
    }

    calculatePrice(product: Product, quantity: number = 1, paymentMethod: string = 'credit_card', extraOptions: { transferDiscountPercentage?: number } = {}): Money {
        const context: PricingContext = {
            product,
            quantity,
            paymentMethod,
            ...extraOptions
        };

        // 1. Determine base effective price (Regular vs Promotional)
        let baseStrategy = this.strategies.get('regular')!;
        if (product.hasDiscount()) {
            baseStrategy = this.strategies.get('promotional')!;
        }

        // We assume the base calculation uses the product single unit price as 'basePrice' input for the strategy
        // But strategies technically take a "basePrice". 
        // For 'promotional', the basePrice (product.price) might be ignored in favor of product.promotionalPrice internal to strategy,
        // OR we pass the correct starting price.
        // Let's pass standard product.price as the anchor.
        let currentTotal = baseStrategy.calculate(product.price, context);

        // 2. Apply Payment Method adjustments (Strategy Chaining or Selection)
        if (paymentMethod === 'transfer') {
            const transferStrategy = this.strategies.get('transfer')!;
            // For transfer, we might want to calculate based on the *current* total (which might be promotional)
            // But verify business logic: Transfer discount applies to promotional price?
            // "const transferPrice = currentPrice * (1 - TRANSFER_DISCOUNT_DECIMAL);" 
            // Yes, it applies to the 'currentPrice' (which is promo or regular).

            // However, my TransferStrategy implementation creates a new price from "basePrice".
            // So if I pass 'currentTotal' (per unit) as basePrice, it works.
            // But currentTotal is *total* for quantity.
            // Re-reading logic: strategies return *total* for context.quantity.

            // To reuse TransferStrategy correctly which multiplies by quantity, I should pass the unit price.
            // Let's adjust:
            const unitPrice = currentTotal.multiply(1 / quantity); // Reverse quantity (safe?) or just pass 1 to get unit?

            // Better approach: Calculate Unit Price first
            let unitBase = product.price;
            if (product.hasDiscount() && product.promotionalPrice) {
                unitBase = product.promotionalPrice;
            }

            // Apply transfer discount to that unit base
            currentTotal = transferStrategy.calculate(unitBase, context);
        }

        return currentTotal;
    }

    /**
     * Helper to get the transfer payment price for a single unit of a product
     */
    getTransferPrice(product: Product): Money {
        return this.calculatePrice(product, 1, 'transfer');
    }
}
