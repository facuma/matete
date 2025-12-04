'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/cart-context';
import { getProductImage } from '@/lib/utils';

export default function ProductCard({ product, variant = 'default' }) {
    const { addToCart } = useCart();
    const isCompact = variant === 'compact';

    return (
        <div className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-stone-100 flex flex-col h-full ${isCompact ? 'text-sm' : ''}`}>
            <Link href={`/productos/${product.slug}`} className="relative overflow-hidden aspect-square cursor-pointer">
                <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full font-bold shadow-sm ${isCompact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'}`}>
                    {product.category}
                </div>
            </Link>
            <div className={`flex flex-col flex-grow ${isCompact ? 'p-3' : 'p-5'}`}>
                <Link href={`/productos/${product.slug}`}>
                    <h3 className={`font-bold text-[#1a1a1a] mb-1 cursor-pointer hover:text-[#8B5A2B] ${isCompact ? 'text-base' : 'text-lg'}`}>
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={isCompact ? 12 : 14} className={i < Math.floor(product.rating) ? "fill-[#D4A373] text-[#D4A373]" : "text-gray-300"} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">({product.rating})</span>
                </div>

                <div className="mt-auto mb-4">
                    {product.promotionalPrice ? (
                        <div className="flex items-center gap-2">
                            <span className={`text-stone-400 line-through font-light ${isCompact ? 'text-xs' : 'text-sm'}`}>
                                ${product.price.toLocaleString('es-AR')}
                            </span>
                            <span className={`font-serif text-[#1a1a1a] font-semibold ${isCompact ? 'text-lg' : 'text-xl'}`}>
                                ${product.promotionalPrice.toLocaleString('es-AR')}
                            </span>
                            <span className="bg-[#1a1a1a] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                {Math.round(((product.price - product.promotionalPrice) / product.price) * 100)}% OFF
                            </span>
                        </div>
                    ) : (
                        <p className={`font-serif text-[#1a1a1a] font-semibold ${isCompact ? 'text-lg' : 'text-xl'}`}>
                            ${product.price.toLocaleString('es-AR')}
                        </p>
                    )}
                </div>

                <Button
                    onClick={() => addToCart({
                        ...product,
                        price: product.promotionalPrice || product.price,
                        regularPrice: product.price
                    })}
                    variant="primary"
                    className={`w-full flex items-center justify-center gap-2 ${isCompact ? 'py-1.5 text-xs' : 'py-2 text-sm'}`}
                >
                    <span>Agregar</span> <ShoppingBag size={isCompact ? 14 : 16} />
                </Button>
            </div>
        </div>
    );
};