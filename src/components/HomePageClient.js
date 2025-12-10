'use client';

import React from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import FeaturesGrid from '@/components/home/FeaturesGrid';
import FlashSale from '@/components/home/FlashSale';
import ProductGrid from '@/components/home/ProductGrid';
import Banner from '@/components/home/Banner';
import BlogGallery from '@/components/home/BlogGallery';
import { getProductImage } from '@/lib/utils';
import { useProducts } from '@/contexts/product-context';
import { useContent } from '@/contexts/content-context';

// Component Registry
const SECTIONS = {
    'hero_slider': HeroSlider,
    'features_grid': FeaturesGrid,
    'flash_sale': FlashSale,
    'product_grid': ProductGrid,
    'banner': Banner,
    'blog_gallery': BlogGallery,
};

function HomeSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Hero Skeleton */}
            <div className="h-[70vh] w-full bg-stone-200" />

            {/* Features Skeleton */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-stone-200 rounded-lg" />)}
            </div>

            {/* Products Skeleton */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="h-10 w-64 bg-stone-200 rounded mb-8 mx-auto" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-stone-200 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function HomePageClient() {
    const { products } = useProducts();
    const { content, loading: contentLoading } = useContent();

    // If content is strictly loading and null, show skeleton.
    // If we have content (from cache), show it immediately even if revalidating.
    if (contentLoading && !content) {
        return <HomeSkeleton />;
    }

    // Prepare Data
    const productsWithImage = products.map(p => ({ ...p, image: getProductImage(p) }));
    const transferDiscount = content?.transferDiscount || 0;

    // Parse Sections Logic
    let sections = Array.isArray(content?.sections) ? content.sections : [];

    // Fallback Legacy Logic
    if (sections.length === 0 && content) {
        if (content.heroSlider?.length) sections.push({ id: 'legacy-hero', type: 'hero_slider', data: { slides: content.heroSlider } });
        if (content.promoGrid?.length) sections.push({ id: 'legacy-promo', type: 'features_grid', data: { items: content.promoGrid } });
        if (content.flashDeal?.enabled) sections.push({ id: 'legacy-flash', type: 'flash_sale', data: content.flashDeal });

        // Ensure "Featured" works even if products are loading (it will just be empty initially, or we pass loading state to ProductGrid)
        sections.push({ id: 'legacy-feat', type: 'product_grid', data: { title: 'Los Elegidos 🔥', filter: 'featured', count: 8 } });

        if (content.campaign?.bannerImage) sections.push({ id: 'legacy-camp', type: 'banner', data: { image: content.campaign.bannerImage, title: content.campaign.title, link: content.campaign.link, buttonText: 'Ver Campaña' } });
    }

    // Default Fallback if completely empty (e.g. first run DB)
    if (sections.length === 0 && !contentLoading) {
        return <div className="py-20 text-center text-stone-500">Configurando tienda...</div>;
    }

    return (
        <div className={`animate-[fadeIn_0.5s_ease-in-out] ${content?.disableInteraction ? 'pointer-events-none select-none' : ''}`}>
            {sections.map((section, index) => {
                const Component = SECTIONS[section.type];
                if (!Component) return null;

                return (
                    <Component
                        key={section.id || index}
                        data={section.data}
                        products={productsWithImage}
                        transferDiscount={transferDiscount}
                    />
                );
            })}
        </div>
    );
}
