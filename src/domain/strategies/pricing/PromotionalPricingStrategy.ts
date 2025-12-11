import { IPricingStrategy, PricingContext } from '../../interfaces/IPricingStrategy';
import { Money } from '../../value-objects/Money';

export class PromotionalPricingStrategy implements IPricingStrategy {
    calculate(basePrice: Money, context: PricingContext): Money {
        if (context.product.promotionalPrice) {
            return context.product.promotionalPrice.multiply(context.quantity);
        }
        return basePrice.multiply(context.quantity);
    }

    getName(): string {
        return 'Promotional Price';
    }
}
