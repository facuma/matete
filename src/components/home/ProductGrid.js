'use client';

import React from 'react';
import ProductCard from '@/components/ProductCard';

export default function ProductGrid({ data, products = [], transferDiscount = 0 }) {
    // data can include: title, subtitle, count, filter (featured, latest, category)

    let displayProducts = [...products];

    // Filter logic based on config
    if (data.filter === 'featured') {
        displayProducts = displayProducts.filter(p => p.featured);
    }
    // Add more filters if needed (e.g. category)

    // Limit count
    if (data.count) {
        displayProducts = displayProducts.slice(0, parseInt(data.count));
    }

    if (displayProducts.length === 0) return null;

    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                {data.title && <h2 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-3">{data.title}</h2>}
                {data.subtitle && <p className="text-stone-500">{data.subtitle}</p>}
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 pb-6 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                {displayProducts.map(p => (
                    <div key={p.id} className="min-w-[70vw] md:min-w-0 snap-center">
                        <ProductCard product={p} transferDiscount={transferDiscount} />
                    </div>
                ))}
            </div>
        </section>
    );
}
