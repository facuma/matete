'use client';

import React, { useMemo } from 'react';
import { useCart } from '@/contexts/cart-context'; // Will eventualy be CartService
import { useServices } from '@/contexts/services/service-context';
import { ProductMapper } from '@/infrastructure/mappers/ProductMapper';
import { Money } from '@/domain/value-objects/Money';
import { Typography } from '@/components/atoms/Typography';
import { Badge } from '@/components/atoms/Badge';
import Button from '@/components/ui/Button';
import { X, Loader2, Tag } from 'lucide-react';

interface OrderSummaryProps {
    shippingPrice?: number;
    paymentMethod?: 'mercadopago' | 'transfer';
    discountCode?: string;
    appliedDiscount?: any; // Type strictly later
    transferDiscount?: number;
    onDiscountChange?: (code: string) => void;
    onApplyDiscount?: () => void;
    onRemoveDiscount?: () => void;
    discountError?: string;
    isValidating?: boolean;
}

export const OrderSummary = ({
    shippingPrice = 0,
    paymentMethod = 'mercadopago',
    appliedDiscount,
    transferDiscount = 10,
    discountCode = '',
    onDiscountChange,
    onApplyDiscount,
    onRemoveDiscount,
    discountError,
    isValidating
}: OrderSummaryProps) => {
    const { cart } = useCart();
    const { pricingService } = useServices();

    const calculations = useMemo(() => {
        let subtotalAmount = 0;
        let totalAmount = 0;
        let savingsAmount = 0;

        // Calculate product totals using PricingService strategy
        cart.forEach((item: any) => {
            // item is CartItem { product: Product, quantity: number ... }
            if (!item.product) return; // Safety check

            const product = item.product; // Already a domain object

            // Base calculation (promotional?)
            const linePrice = pricingService.calculatePrice(
                product,
                item.quantity,
                paymentMethod,
                { transferDiscountPercentage: transferDiscount }
            );

            // Regular calculation for comparison
            const regularPrice = product.price.multiply(item.quantity);

            subtotalAmount += regularPrice.amount;
            totalAmount += linePrice.amount;
        });

        savingsAmount = subtotalAmount - totalAmount;

        // Apply external discounts (coupon) - Strategy pattern could handle this too if refactored
        // For now, simple logic like before
        if (appliedDiscount) {
            const discountValue = totalAmount * (appliedDiscount.percentage / 100);
            totalAmount -= discountValue;
            savingsAmount += discountValue;
        }

        // Add Shipping
        totalAmount += shippingPrice;

        return {
            subtotal: new Money(subtotalAmount),
            total: new Money(totalAmount),
            savings: new Money(savingsAmount),
            shipping: new Money(shippingPrice)
        };
    }, [cart, pricingService, paymentMethod, appliedDiscount, shippingPrice, transferDiscount]);

    return (
        <div className="bg-stone-50 p-8 rounded-xl h-fit border border-stone-200 sticky top-28">
            <Typography variant="h4" className="mb-6">Resumen del Pedido</Typography>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item: any) => {
                    const product = item.product;
                    if (!product) return null;
                    return (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-stone-600">
                                {item.quantity}x {product.name}
                                {item.selectedOptions && Object.values(item.selectedOptions).flat().length > 0 && (
                                    <span className="block text-xs text-stone-400 ml-4">
                                        {Object.values(item.selectedOptions).flat().map((val: any) => `+ ${val.name}`).join(', ')}
                                    </span>
                                )}
                            </span>
                            <span className="font-medium">
                                {/* Show effective price total per line */}
                                {product.effectivePrice.multiply(item.quantity).format()}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Coupon Section */}
            <div className="mb-6 pt-4 border-t border-stone-200">
                {appliedDiscount ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                            <Tag size={16} />
                            <span className="text-sm font-bold">{appliedDiscount.code}</span>
                            <span className="text-xs">(-{appliedDiscount.percentage}%)</span>
                        </div>
                        <button
                            onClick={onRemoveDiscount}
                            className="text-green-700 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Código de descuento"
                                value={discountCode}
                                onChange={(e) => onDiscountChange && onDiscountChange(e.target.value)}
                                className="flex-1 text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black uppercase"
                            />
                            <Button
                                onClick={onApplyDiscount}
                                disabled={!discountCode || isValidating}
                                className="px-4 py-2 text-xs font-bold bg-stone-800 text-white rounded-lg disabled:opacity-50"
                            >
                                {isValidating ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                            </Button>
                        </div>
                        {discountError && (
                            <p className="text-xs text-red-500 font-medium">{discountError}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-4 border-t border-stone-200">
                <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span>{calculations.subtotal.format()}</span>
                </div>

                {calculations.savings.amount > 0 && (
                    <div className="flex justify-between text-[#8B5A2B] font-medium">
                        <span>Descuentos</span>
                        <span>-{calculations.savings.format()}</span>
                    </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-stone-600">
                    <span>Envío</span>
                    <span>{calculations.shipping.amount === 0 ? 'Gratis' : calculations.shipping.format()}</span>
                </div>

                <div className="border-t border-stone-200 pt-3 mt-2">
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-lg text-[#1a1a1a]">Total</span>
                        <div className="text-right">
                            <Typography variant="h3" className="text-2xl font-bold text-[#1a1a1a] leading-none">
                                {calculations.total.format()}
                            </Typography>
                            {paymentMethod === 'transfer' && (
                                <Badge variant="success" className="bg-green-100 text-green-700 border-0 mt-1">
                                    Precio Transferencia
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
