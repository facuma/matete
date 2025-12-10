'use client';

import React from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import FeaturesGrid from '@/components/home/FeaturesGrid';
import FlashSale from '@/components/home/FlashSale';
import ProductGrid from '@/components/home/ProductGrid';
import Banner from '@/components/home/Banner';
import { getProductImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Link from 'next/link';

// Component Registry
const SECTIONS = {
    'hero_slider': HeroSlider,
    'features_grid': FeaturesGrid,
    'flash_sale': FlashSale,
    'product_grid': ProductGrid,
    'banner': Banner,
    // Add 'rich_text' if implemented later
};

export default function HomePageClient({ products, content }) {
    const productsWithImage = products.map(p => ({ ...p, image: getProductImage(p) }));
    const transferDiscount = content?.transferDiscount || 0;

    // Parse Sections
    // If "sections" exists in content, use it. Otherwise, use legacy structure logic or empty.
    let sections = Array.isArray(content?.sections) ? content.sections : [];

    // Fallback if DB hasn't been migrated or content is empty
    if (sections.length === 0 && content) {
        if (content.heroSlider?.length) sections.push({ id: 'legacy-hero', type: 'hero_slider', data: { slides: content.heroSlider } });
        if (content.promoGrid?.length) sections.push({ id: 'legacy-promo', type: 'features_grid', data: { items: content.promoGrid } });
        if (content.flashDeal?.enabled) sections.push({ id: 'legacy-flash', type: 'flash_sale', data: content.flashDeal });
        sections.push({ id: 'legacy-feat', type: 'product_grid', data: { title: 'Los Elegidos 🔥', filter: 'featured', count: 8 } });
        if (content.campaign?.bannerImage) sections.push({ id: 'legacy-camp', type: 'banner', data: { image: content.campaign.bannerImage, title: content.campaign.title, link: content.campaign.link, buttonText: 'Ver Campaña' } });
    }

    return (
        <div className={`animate-[fadeIn_0.5s_ease-in-out] ${content?.disableInteraction ? 'pointer-events-none select-none' : ''}`}>
            {sections.map((section, index) => {
                const Component = SECTIONS[section.type];
                if (!Component) return null;

                // Pass common props + section specific data
                return (
                    <Component
                        key={section.id || index}
                        data={section.data}
                        products={productsWithImage}
                        transferDiscount={transferDiscount}
                    />
                );
            })}


            {/* Always show legacy About footer for now, or make it a section too? 
                 The user asked for modular. I will create a TextSection if needed, but for now 
                 I'll render the legacy About section ONLY if not present in sections to avoid losing it.
             */}
            {!sections.find(s => s.type === 'about') && content?.aboutTitle && (
                <section className="bg-[#1a1a1a] text-white py-24">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-serif font-bold mb-6 text-[#D4A373]">{content?.aboutTitle || "Sobre Nosotros"}</h2>
                            <p className="text-stone-300 leading-relaxed mb-6">
                                {content?.aboutText || "Nacimos con la misión de revalorizar el ritual del mate."}
                            </p>
                            <Link href="/shop" passHref>
                                <Button variant="secondary">Conocé más</Button>
                            </Link>
                        </div>
                        {content?.aboutImage1 && (
                            <div className="grid grid-cols-2 gap-4">
                                <img src={content.aboutImage1} className="rounded-lg mt-8 w-full h-full object-cover" alt="About" />
                                {content.aboutImage2 && <img src={content.aboutImage2} className="rounded-lg w-full h-full object-cover" alt="About" />}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
