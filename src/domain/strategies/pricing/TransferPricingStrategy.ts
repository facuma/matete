import { IPricingStrategy, PricingContext } from '../../interfaces/IPricingStrategy';
import { Money } from '../../value-objects/Money';

export class TransferPricingStrategy implements IPricingStrategy {
    calculate(basePrice: Money, context: PricingContext): Money {
        // Use percentage from context or default to 10 (matching user expectation)
        const percentage = context.transferDiscountPercentage ?? 10;

        const discountPercentage = percentage / 100;
        const discountAmount = basePrice.multiply(discountPercentage);
        const finalPricePerUnit = basePrice.subtract(discountAmount);

        return finalPricePerUnit.multiply(context.quantity);
    }

    getName(): string {
        return 'Transfer Discount';
    }
}
