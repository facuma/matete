import React from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils'; // Assuming cn exists in utils based on typical setup

export const ProductOptionCard = ({ value, isSelected, onToggle }) => {
    const linkedImg = value.linkedProduct?.imageUrl || (value.linkedProduct?.images && value.linkedProduct.images[0]);

    return (
        <button
            onClick={onToggle}
            className={cn(
                "group relative flex flex-col items-center gap-3 p-4 text-center rounded-2xl border transition-all duration-300 h-full w-full",
                isSelected
                    ? "border-black bg-stone-50 ring-1 ring-black shadow-sm"
                    : "border-stone-200 bg-white hover:border-stone-400 hover:shadow-md"
            )}
        >
            {/* Visual Checkmark - Floating Top Right */}
            <div className={cn(
                "absolute top-3 right-3 w-6 h-6 rounded-full border flex items-center justify-center transition-colors z-10",
                isSelected
                    ? "bg-black border-black text-white"
                    : "border-stone-300 bg-white group-hover:border-stone-400"
            )}>
                {isSelected && <Check size={14} strokeWidth={3} />}
            </div>

            {/* Image / Icon */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-100 relative mb-2">
                {linkedImg ? (
                    <img src={linkedImg} alt={value.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ShoppingCart size={24} />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full flex flex-col items-center">
                <span className="text-sm font-bold text-[#1a1a1a] leading-tight line-clamp-2 mb-1">
                    {value.name}
                </span>

                {value.priceModifier > 0 && (
                    <span className="text-xs font-semibold text-stone-500">
                        +{formatPrice(value.priceModifier)}
                    </span>
                )}
            </div>
        </button>
    );
};
