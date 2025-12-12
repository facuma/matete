'use client';

import React from 'react'; // Removed unused useState, useEffect
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { useProducts } from '@/contexts/product-context'; // Import unified store
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { getProductImage } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function CartSidebar() {
    const { cart, isCartOpen, setIsCartOpen, removeItem, cartTotal, cartCount, cartSubtotal, cartSavings, addItem, updateQuantity } = useCart();
    const { products } = useProducts(); // Use cached products for stock check

    // Get available stock for a product from the unified store
    const getAvailableStock = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return 999; // Default high number if not found
        return (product.stock || 0) - (product.reservedStock || 0);
    };

    // Check if product is at max quantity
    const isAtMaxStock = (item) => {
        const availableStock = getAvailableStock(item.product.id);
        return item.quantity >= availableStock;
    };

    // Check if product has low stock (less than 5 units available)
    const hasLowStock = (item) => {
        const availableStock = getAvailableStock(item.product.id);
        return availableStock > 0 && availableStock <= 5;
    };

    return (
        <div className={`fixed inset-0 z-[60] transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
                <div className="p-6 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-serif text-[#1a1a1a]">Tu Carrito ({cartCount})</h2>
                    <button onClick={() => setIsCartOpen(false)} className="hover:bg-stone-200 p-1 rounded-full"><X /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="text-center py-20 text-stone-400">
                            <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                            <p>El carrito está vacío 🌿</p>
                            <Link href="/shop" passHref>
                                <Button onClick={() => setIsCartOpen(false)} variant="secondary" className="mt-4">Ver Productos</Button>
                            </Link>
                        </div>
                    ) : (
                        cart.map(item => {
                            const product = item.product;
                            const atMaxStock = isAtMaxStock(item);
                            const lowStock = hasLowStock(item);

                            return (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-start gap-2">
                                            <h3 className="font-bold text-[#1a1a1a] text-sm">{product.name}</h3>
                                            {lowStock && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                                                    Últimas unidades
                                                </span>
                                            )}
                                        </div>
                                        {item.selectedOptions && Object.values(item.selectedOptions).flat().map((val, idx) => (
                                            <p key={idx} className="text-xs text-stone-500">+ {val.name}</p>
                                        ))}
                                        <p className="text-[#8B5A2B] text-sm font-medium mb-2">{product.effectivePrice.format()}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center border border-stone-300 rounded-md">
                                                <button
                                                    className="px-2 py-1 hover:bg-stone-100"
                                                    onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 text-sm">{item.quantity}</span>
                                                <button
                                                    className={`px-2 py-1 ${atMaxStock ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-stone-100 text-stone-700'}`}
                                                    onClick={() => !atMaxStock && updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={atMaxStock}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="text-stone-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 bg-stone-50 border-t border-stone-200">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-stone-600">
                                <span>Subtotal</span>
                                <span>${cartSubtotal?.toLocaleString('es-AR')}</span>
                            </div>
                            {cartSavings > 0 && (
                                <div className="flex justify-between text-[#8B5A2B] font-medium">
                                    <span>Descuentos</span>
                                    <span>-${cartSavings.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-[#1a1a1a] pt-2 border-t border-stone-200">
                                <span>Total</span>
                                <span>${cartTotal.toLocaleString('es-AR')}</span>
                            </div>
                        </div>
                        <Link href="/checkout" passHref>
                            <Button onClick={() => setIsCartOpen(false)} className="w-full py-4 text-lg">
                                Iniciar Compra
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}