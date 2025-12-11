import { IPricingStrategy, PricingContext } from '../../interfaces/IPricingStrategy';
import { Money } from '../../value-objects/Money';

export class TransferPricingStrategy implements IPricingStrategy {
    private readonly discountMock: number = 20; // This should ideally come from configuration/repo

    calculate(basePrice: Money, context: PricingContext): Money {
        // If payment method is not transfer, return 0 or throw? 
        // Strategy pattern usually returns the *result* price.

        // This strategy implies we apply the discount
        const discountPercentage = this.discountMock / 100;
        const discountAmount = basePrice.multiply(discountPercentage);
        const finalPricePerUnit = basePrice.subtract(discountAmount);

        return finalPricePerUnit.multiply(context.quantity);
    }

    getName(): string {
        return 'Transfer Discount';
    }
}
