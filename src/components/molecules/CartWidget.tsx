'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';
import { Badge } from '../atoms/Badge';

interface CartWidgetProps {
    className?: string;
}

export const CartWidget = ({ className }: CartWidgetProps) => {
    const { cartCount, setIsCartOpen } = useCart();

    return (
        <div
            className={cn("relative cursor-pointer hover:text-[#D4A373] transition-colors", className)}
            onClick={() => setIsCartOpen(true)}
        >
            <ShoppingBag />
            {cartCount > 0 && (
                <div className="absolute -top-2 -right-2">
                    <Badge variant="destructive" className="bg-[#8B5A2B] text-white w-5 h-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                        {cartCount}
                    </Badge>
                </div>
            )}
        </div>
    );
};
