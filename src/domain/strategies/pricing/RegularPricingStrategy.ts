import { IPricingStrategy, PricingContext } from '../../interfaces/IPricingStrategy';
import { Money } from '../../value-objects/Money';

export class RegularPricingStrategy implements IPricingStrategy {
    calculate(basePrice: Money, context: PricingContext): Money {
        // Regular price is just the base price (or promotional if exists, usually handled before or via another strategy)
        // In this architecture, we treat "Regular" as the fallback/standard calculation
        return basePrice.multiply(context.quantity);
    }

    getName(): string {
        return 'Regular Pricing';
    }
}
