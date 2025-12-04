'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/cart-context';
import { getProductImage } from '@/lib/utils';
// import { getAIImage } from '@/lib/utils';

export default function ShopPage() {
    const [filterCategory, setFilterCategory] = useState('Todos');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const categories = ['Todos', 'Mates', 'Bombillas', 'Yerbas', 'Accesorios'];
    const filteredProducts = filterCategory === 'Todos'
        ? products
        : products.filter(p => p.category === filterCategory);

    return (
        <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-in-out]">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-2">Tienda Online</h1>
                    <p className="text-stone-500">Encontrá todo para tu ritual.</p>
                </div>

                {/* Filters */}
                <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === cat
                                ? 'bg-[#1a1a1a] text-white'
                                : 'bg-white text-stone-600 border border-stone-200 hover:border-[#1a1a1a]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Cargando productos...</div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map(p => ({ ...p, image: getProductImage(p) })).map(p => (
                        <ProductCard key={p.id} product={p} onAdd={() => addToCart(p, 1)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-stone-400">No encontramos productos en esta categoría.</p>
                    <button onClick={() => setFilterCategory('Todos')} className="text-[#8B5A2B] underline mt-2">Ver todos</button>
                </div>
            )}
        </div>
    );
}