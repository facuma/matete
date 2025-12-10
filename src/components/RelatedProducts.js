'use client';
import { useProducts } from '@/contexts/product-context';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function RelatedProducts({ currentProductId, currentCategory }) {
    const { products: allProducts, loading } = useProducts();
    const [displayProducts, setDisplayProducts] = useState([]);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (!allProducts || allProducts.length === 0) return;

        // Filter out current product
        let available = allProducts.filter(p => p.id !== parseInt(currentProductId));

        // Cross-selling logic
        let prioritized = [];
        let others = [];

        if (currentCategory === 'Mates') {
            prioritized = available.filter(p => ['Bombillas', 'Yerbas'].includes(p.category));
            others = available.filter(p => !['Bombillas', 'Yerbas'].includes(p.category));
        } else if (currentCategory === 'Termos') {
            prioritized = available.filter(p => ['Mates', 'Accesorios'].includes(p.category));
            others = available.filter(p => !['Mates', 'Accesorios'].includes(p.category));
        } else {
            // Default: same category or random
            prioritized = available.filter(p => p.category === currentCategory);
            others = available.filter(p => p.category !== currentCategory);
        }

        // Combine: Prioritized first, then others
        const finalSelection = [...prioritized, ...others].slice(0, 8); // Limit to 8 items

        setDisplayProducts(finalSelection);

    }, [currentProductId, currentCategory, allProducts]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width

            if (direction === 'left') {
                if (container.scrollLeft <= 0) {
                    // If at start, scroll to end (infinite loop effect)
                    container.scrollTo({
                        left: container.scrollWidth,
                        behavior: 'smooth'
                    });
                } else {
                    container.scrollBy({
                        left: -scrollAmount,
                        behavior: 'smooth'
                    });
                }
            } else {
                // Check if we are near the end
                // Allow a small buffer (e.g. 10px) for float calculation errors
                if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                    // If at end, scroll to start (infinite loop effect)
                    container.scrollTo({
                        left: 0,
                        behavior: 'smooth'
                    });
                } else {
                    container.scrollBy({
                        left: scrollAmount,
                        behavior: 'smooth'
                    });
                }
            }
        }
    };

    if (loading && displayProducts.length === 0) return null; // Show nothing while loading if no products
    if (!loading && displayProducts.length === 0) return null;

    return (
        <div className="mt-20 mb-10">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">
                    También te podría interesar
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-colors text-stone-600"
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-colors text-stone-600"
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="relative">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                    }}
                >
                    {displayProducts.map(product => (
                        <div key={product.id} className="min-w-[240px] md:min-w-[260px] snap-center">
                            <ProductCard product={product} variant="compact" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
