'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/organisms/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { useCategories } from '@/contexts/category-context';
import { useCart } from '@/contexts/cart-context';
import { getProductImage } from '@/lib/utils'; // Make sure utils are client-friendly or move logic

import { useProducts } from '@/contexts/product-context';

export default function CategoryClientPage({ slugArray }) {
    const slug = slugArray[slugArray.length - 1];
    const { categories } = useCategories();
    const { products: allProducts, loading: productsLoading } = useProducts();
    const { addItem } = useCart();

    const [transferDiscount, setTransferDiscount] = useState(20);

    // Fetch Transfer Discount only
    useEffect(() => {
        fetch('/api/promotions/transfer')
            .then(res => res.json())
            .then(data => {
                if (data && data.discount) setTransferDiscount(data.discount);
            })
            .catch(err => console.error(err));
    }, []);

    // Resolve current category from context
    const currentCategory = useMemo(() => {
        const findCategory = (slug, list) => {
            for (const cat of list) {
                if (cat.slug === slug) return cat;
                if (cat.children) {
                    const found = findCategory(slug, cat.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findCategory(slug, categories);
    }, [slug, categories]);

    // Filter products
    const products = useMemo(() => {
        if (!currentCategory) return [];
        const targetIds = [currentCategory.id, ...(currentCategory.children?.map(c => c.id) || [])];
        return allProducts.filter(p => targetIds.includes(p.categoryId));
    }, [currentCategory, allProducts]);

    if (!currentCategory && !productsLoading && categories.length > 0) {
        return (
            <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-4">Categoría no encontrada</h1>
                <Link href="/shop" className="text-[#8B5A2B] hover:underline">Volver a la tienda</Link>
            </div>
        );
    }

    // While loading initial data, show skeleton
    // Also if categories context is still loading (empty), show skeleton
    if (productsLoading || categories.length === 0) {
        return (
            <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
                <div className="mb-8 animate-pulse">
                    <div className="h-4 w-32 bg-stone-200 rounded mb-4" />
                    <div className="h-10 w-48 bg-stone-200 rounded mb-4" />
                    <div className="h-4 w-full max-w-2xl bg-stone-200 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-in-out]">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
                    <Link href="/" className="hover:text-[#1a1a1a]">Inicio</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-[#1a1a1a]">Productos</Link>
                    <span>/</span>
                    <span className="text-[#1a1a1a] font-medium">{currentCategory?.name}</span>
                </div>
                <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-4">{currentCategory?.name}</h1>
                <p className="text-stone-600 max-w-2xl">
                    Explorá nuestra colección de {currentCategory?.name.toLowerCase()}.
                </p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-2xl">
                    <p className="text-xl text-stone-500">No se encontraron productos en esta categoría.</p>
                    <Link href="/shop" className="inline-block mt-4 text-[#8B5A2B] font-medium hover:underline">
                        Ver todos los productos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            transferDiscount={transferDiscount}
                            onAdd={() => addItem(product)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
