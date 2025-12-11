import React from 'react';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Money } from '@/domain/value-objects/Money';

interface ProductPriceProps {
    price: Money;
    promotionalPrice?: Money;
    showBadge?: boolean;
    className?: string;
}

export const ProductPrice = ({ price, promotionalPrice, showBadge = true, className }: ProductPriceProps) => {
    const hasDiscount = !!promotionalPrice;

    // We assume price and promotionalPrice are instances of Money
    // If they come from raw JSON, we might need to instantiate Money here or handled upstream
    // Ideally upstream (Repository) does this.

    if (!hasDiscount || !promotionalPrice) {
        return (
            <div className={className}>
                <Typography variant="h3" className="text-[#8B5A2B] font-serif font-bold">
                    {price.format()}
                </Typography>
            </div>
        );
    }

    const discountPercentage = Math.round(((price.amount - promotionalPrice.amount) / price.amount) * 100);

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-stone-400 line-through text-xs font-medium">
                    {price.format()}
                </span>
                <Typography variant="h3" className="text-[#8B5A2B] font-serif font-bold">
                    {promotionalPrice.format()}
                </Typography>
                {showBadge && (
                    <Badge variant="destructive" className="bg-[#8B5A2B] hover:bg-[#8B5A2B]/90 ml-1">
                        {discountPercentage}% OFF
                    </Badge>
                )}
            </div>
        </div>
    );
};
