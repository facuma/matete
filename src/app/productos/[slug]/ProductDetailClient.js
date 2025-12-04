'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import Button from '@/components/ui/Button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { getProductImage } from '@/lib/utils';
import RelatedProducts from '@/components/RelatedProducts';

import Breadcrumbs from '@/components/ui/Breadcrumbs';

import { event } from '@/components/FacebookPixel';

export default function ProductDetailClient({ product }) {
    const { addToCart } = useCart();
    const [selectedOptions, setSelectedOptions] = useState({});

    useEffect(() => {
        if (product) {
            event('ViewContent', {
                content_name: product.name,
                content_ids: [product.id],
                content_type: 'product',
                value: product.promotionalPrice || product.price,
                currency: 'ARS'
            });
        }
    }, [product]);

    if (!product) {
        return <div className="pt-28 text-center">Producto no encontrado.</div>;
    }

    // Calculate dynamic price
    const basePrice = product.promotionalPrice || product.price || 0;
    const currentPrice = basePrice + Object.values(selectedOptions).reduce((acc, val) => acc + (val?.priceModifier || 0), 0);

    // Calculate discount percentage
    const discountPercentage = product.promotionalPrice
        ? Math.round(((product.price - product.promotionalPrice) / product.price) * 100)
        : 0;

    const breadcrumbItems = [
        { label: product.category || 'Tienda', href: `/categorias/${product.category?.toLowerCase() || 'todos'}` },
        { label: product.name, href: null } // Current page
    ];

    return (
        <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-in-out]">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="grid md:grid-cols-2 gap-12 bg-white p-6 md:p-12 rounded-2xl shadow-sm">
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100">
                    <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[#8B5A2B] font-medium tracking-wide uppercase text-sm mb-2">{product.category}</span>
                    <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        {product.promotionalPrice && (
                            <span className="text-2xl text-stone-400 line-through font-light">
                                ${product.price.toLocaleString('es-AR')}
                            </span>
                        )}
                        <p className="text-3xl text-[#1a1a1a] font-light">
                            ${currentPrice.toLocaleString('es-AR')}
                        </p>
                        {product.promotionalPrice && (
                            <span className="px-2 py-1 border border-[#1a1a1a] rounded text-xs font-medium uppercase tracking-wider">
                                {discountPercentage}% OFF
                            </span>
                        )}
                    </div>

                    <p className="text-stone-600 leading-relaxed mb-8">{product.description}</p>

                    {/* Product Options */}
                    {product.options && product.options.length > 0 && (
                        <div className="space-y-8 mb-8">
                            {product.options.map(option => (
                                <div key={option.id}>
                                    <label className="block text-sm font-medium text-stone-700 mb-3 uppercase tracking-wide">
                                        {option.name}
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {option.values.map(val => {
                                            const isSelected = selectedOptions[option.name]?.id === val.id;
                                            return (
                                                <button
                                                    key={val.id}
                                                    className={`relative flex flex-col p-2 rounded-xl border-2 transition-all text-left group ${isSelected
                                                        ? 'border-[#1a1a1a] bg-stone-50 shadow-sm'
                                                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                                                        }`}
                                                    onClick={() => {
                                                        setSelectedOptions(prev => {
                                                            // Toggle selection
                                                            if (prev[option.name]?.id === val.id) {
                                                                const newState = { ...prev };
                                                                delete newState[option.name];
                                                                return newState;
                                                            }
                                                            return {
                                                                ...prev,
                                                                [option.name]: val
                                                            };
                                                        });
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 bg-[#1a1a1a] text-white rounded-full p-1 z-10">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-white mb-2 relative">
                                                        {val.linkedProduct?.imageUrl ? (
                                                            <img
                                                                src={val.linkedProduct.imageUrl}
                                                                alt={val.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold leading-tight mb-1 ${isSelected ? 'text-[#1a1a1a]' : 'text-stone-700'}`}>
                                                            {val.name}
                                                        </span>
                                                        {val.priceModifier > 0 && (
                                                            <span className="text-xs font-medium text-[#8B5A2B]">
                                                                +${val.priceModifier.toLocaleString('es-AR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Button
                            onClick={() => {
                                const regularPrice = product.price + Object.values(selectedOptions).reduce((acc, val) => acc + (val?.priceModifier || 0), 0);
                                addToCart({ ...product, price: currentPrice, regularPrice }, 1, selectedOptions);
                            }}
                            className="w-full py-4 text-lg"
                        >
                            Agregar al Carrito 🧉
                        </Button>
                        <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-2">
                            <ShieldCheck size={14} /> Compra protegida. Devolución gratis.
                        </p>
                    </div>
                </div>
            </div>

            <RelatedProducts currentProductId={product.id} currentCategory={product.category} />
        </div>
    );
}
