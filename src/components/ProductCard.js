'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/cart-context';
import { getProductImage, cn } from '@/lib/utils';

export default function ProductCard({ product, variant = 'default', transferDiscount = 20, className = '' }) {
    const { addToCart } = useCart();
    const isCompact = variant === 'compact';

    // Calculate available stock
    const availableStock = (product.stock || 0) - (product.reservedStock || 0);
    const isOutOfStock = availableStock <= 0;

    // Price Logic
    const TRANSFER_DISCOUNT_DECIMAL = transferDiscount / 100;
    const currentPrice = product.promotionalPrice || product.price;
    const transferPrice = currentPrice * (1 - TRANSFER_DISCOUNT_DECIMAL);
    const hasDiscount = !!product.promotionalPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.price - product.promotionalPrice) / product.price) * 100)
        : 0;

    return (
        <div className={cn(
            "group bg-white rounded-xl shadow-sm transition-all duration-300 overflow-hidden border border-stone-100 flex flex-col h-full",
            isCompact ? 'text-sm' : '',
            isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-xl',
            className
        )}>
            <div className={`relative overflow-hidden aspect-square ${isOutOfStock ? 'pointer-events-none' : 'cursor-pointer'}`}>
                {isOutOfStock ? (
                    <div className="relative">
                        <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                                SIN STOCK
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link href={`/productos/${product.slug}`}>
                        <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Discount Badge */}
                        {hasDiscount && (
                            <div className="absolute top-3 left-3 bg-[#D32F2F] text-white rounded-full w-11 h-11 flex flex-col items-center justify-center shadow-lg z-10 border-2 border-white ring-1 ring-black/5">
                                <span className="text-xs font-bold leading-none">{discountPercentage}%</span>
                                <span className="text-[9px] font-medium leading-none mt-0.5">OFF</span>
                            </div>
                        )}
                        {/* Category Badge */}
                        <div className={cn(
                            "absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-full font-bold shadow-md border border-stone-100 text-stone-700",
                            isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                        )}>
                            {product.category}
                        </div>
                    </Link>
                )}
            </div>
            <div className={`flex flex-col flex-grow ${isCompact ? 'p-3' : 'p-5'}`}>
                {isOutOfStock ? (
                    <h3 className={`font-bold text-stone-400 mb-1 ${isCompact ? 'text-base' : 'text-lg'}`}>
                        {product.name}
                    </h3>
                ) : (
                    <Link href={`/productos/${product.slug}`}>
                        <h3 className={`font-bold text-[#1a1a1a] mb-1 cursor-pointer hover:text-[#8B5A2B] ${isCompact ? 'text-base' : 'text-lg'}`}>
                            {product.name}
                        </h3>
                    </Link>
                )}

                <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={isCompact ? 12 : 14} className={i < Math.floor(product.rating) ? "fill-[#D4A373] text-[#D4A373]" : "text-gray-300"} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">({product.rating})</span>
                </div>

                <div className="mt-auto mb-4">
                    {isOutOfStock ? (
                        <div className="flex items-center gap-2">
                            <span className="text-stone-400 font-medium text-sm">
                                Producto no disponible
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Price Row */}
                            <div className="flex items-baseline gap-2 flex-wrap">
                                {hasDiscount && (
                                    <span className="text-stone-400 line-through text-xs font-medium">
                                        ${product.price.toLocaleString('es-AR')}
                                    </span>
                                )}
                                <span className={`font-serif text-[#8B5A2B] font-bold ${isCompact ? 'text-lg' : 'text-xl'}`}>
                                    ${currentPrice.toLocaleString('es-AR')}
                                </span>
                            </div>

                            {/* Transfer Price */}
                            <div className="bg-[#F2F8F5] border border-[#dcfce7] rounded-md p-2 mt-2">
                                <p className="text-[#109f59] font-bold text-sm leading-tight">
                                    ${transferPrice.toLocaleString('es-AR')} <span className="font-medium text-[10px] uppercase text-[#109f59]/80 ml-1">Transferencia</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    onClick={() => addToCart({
                        ...product,
                        price: product.promotionalPrice || product.price,
                        regularPrice: product.price
                    })}
                    variant="primary"
                    className={`w-full flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 ${isCompact ? 'py-1.5 text-xs' : 'py-2 text-sm'}`}
                    disabled={isOutOfStock}
                >
                    <span>{isOutOfStock ? 'No Disponible' : 'Agregar al carrito'}</span>
                    {!isOutOfStock && <ShoppingBag size={isCompact ? 14 : 16} />}
                </Button>
            </div>
        </div>
    );
};
