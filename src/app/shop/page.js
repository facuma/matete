'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProductCard } from '@/components/organisms/ProductCard';
import { useCart } from '@/contexts/cart-context';
import { getProductImage } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import ProductSkeleton from '@/components/ProductSkeleton';
// import { getAIImage } from '@/lib/utils';

import { useCategories } from '@/contexts/category-context';
import { useProducts } from '@/contexts/product-context';

export default function ShopPage() {
    const { categories } = useCategories();
    const { products: allProducts, loading: productsLoading } = useProducts();
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [transferDiscount, setTransferDiscount] = useState(20);
    const { addItem } = useCart();

    // Dropdown state
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch Transfer Discount only (Products come from Context)
    useEffect(() => {
        fetch('/api/promotions/transfer')
            .then(res => res.json())
            .then(data => {
                if (data && data.discount) setTransferDiscount(data.discount);
            })
            .catch(err => console.error(err));
    }, []);

    // Client-side Filtering Logic
    const products = React.useMemo(() => {
        if (selectedCategory === 'todos') return allProducts;

        // Find the selected category object (could be parent or child)
        let targetIds = [];

        // Helper to search in tree
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

        const category = findCategory(selectedCategory, categories);

        if (category) {
            targetIds = [category.id, ...(category.children?.map(c => c.id) || [])];
        }

        return allProducts.filter(p => targetIds.includes(p.categoryId));
    }, [selectedCategory, allProducts, categories]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category.slug);
        setOpenDropdown(null);
    };

    const toggleDropdown = (e, categoryId) => {
        e.stopPropagation();
        setOpenDropdown(openDropdown === categoryId ? null : categoryId);
    };

    return (
        <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-in-out]">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-2">Tienda Online</h1>
                    <p className="text-stone-500">Encontrá todo para tu ritual.</p>
                </div>

                {/* Filters */}
                <div className="mt-6 md:mt-0 flex flex-wrap gap-2 relative" ref={dropdownRef}>
                    <button
                        onClick={() => setSelectedCategory('todos')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'todos'
                            ? 'bg-[#1a1a1a] text-white'
                            : 'bg-white text-stone-600 border border-stone-200 hover:border-[#1a1a1a]'
                            }`}
                    >
                        Todos
                    </button>
                    {categories.map(cat => {
                        const isSelected = selectedCategory === cat.slug;
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isOpen = openDropdown === cat.id;

                        // Check if a child is selected to highlight the parent
                        const isChildSelected = hasChildren && cat.children.some(c => c.slug === selectedCategory);
                        const isActive = isSelected || isChildSelected;

                        return (
                            <div key={cat.id} className="relative group">
                                <div className={`flex items-center rounded-full border transition-colors ${isActive
                                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#1a1a1a]'
                                    }`}>
                                    <button
                                        onClick={() => handleCategoryClick(cat)}
                                        className="px-4 py-2 text-sm font-medium rounded-l-full"
                                    >
                                        {cat.name}
                                    </button>
                                    {hasChildren && (
                                        <button
                                            onClick={(e) => toggleDropdown(e, cat.id)}
                                            className={`pr-3 pl-1 py-2 rounded-r-full hover:bg-black/10 focus:outline-none transition-colors ${isOpen ? 'bg-black/10' : ''}`}
                                        >
                                            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown Menu */}
                                {hasChildren && isOpen && (
                                    <div className="absolute top-full mt-2 left-0 bg-white shadow-xl rounded-lg border border-stone-100 py-2 min-w-[160px] z-20 animate-[fadeIn_0.2s_ease-out]">
                                        <button
                                            onClick={() => handleCategoryClick(cat)}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-stone-50 ${isSelected ? 'text-[#8B5A2B] font-bold' : 'text-stone-600'}`}
                                        >
                                            Ver todo {cat.name}
                                        </button>
                                        {cat.children.map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => {
                                                    setSelectedCategory(sub.slug);
                                                    setOpenDropdown(null);
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-stone-50 ${selectedCategory === sub.slug ? 'text-[#8B5A2B] font-bold' : 'text-stone-600'}`}
                                            >
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map(p => ({ ...p, image: getProductImage(p) })).map(p => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            transferDiscount={transferDiscount}
                            onAdd={() => addItem(p, 1)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-stone-400">No encontramos productos en esta categoría.</p>
                    <button onClick={() => setSelectedCategory('todos')} className="text-[#8B5A2B] underline mt-2">Ver todos</button>
                </div>
            )}
        </div>
    );
}