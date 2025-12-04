'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, Star } from 'lucide-react';
import { REVIEWS } from '@/lib/data';
import { getProductImage } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/cart-context';

export default function HomePageClient({ products, content }) {
    const { addToCart } = useCart();
    const productsWithImage = products.map(p => ({ ...p, image: getProductImage(p) }));

    // Default values if content is missing or fields are empty
    const heroTitle = content?.heroTitle || "MATETÉ";
    const heroSubtitle = content?.heroSubtitle || "El ritual de cada día";
    const heroButtonText = content?.heroButtonText || "Ver Colección";
    const heroImage = content?.heroImage || "/placeholder-hero.jpg";

    const aboutTitle = content?.aboutTitle || "Sobre Nosotros";
    const aboutText = content?.aboutText || "Nacimos en Resistencia, Chaco, con la misión de revalorizar el ritual del mate. Trabajamos con artesanos locales para crear piezas únicas que combinan cuero legítimo, madera seleccionada y alpaca de primera calidad.";
    const aboutImage1 = content?.aboutImage1 || "/placeholder-about-1.jpg";
    const aboutImage2 = content?.aboutImage2 || "/placeholder-about-2.jpg";

    return (
        <div className="animate-[fadeIn_0.5s_ease-in-out]">
            {/* Hero */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt="Mate Hero"
                        className="w-full h-full object-cover brightness-50 opacity-80"
                    />
                </div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <span className="text-[#D4A373] font-medium tracking-widest uppercase mb-4 block">Tradición Argentina</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
                        {heroTitle}
                    </h1>
                    <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-2xl mx-auto">
                        {heroSubtitle}
                    </p>
                    <Link href="/shop" passHref>
                        <Button variant="outline">{heroButtonText}</Button>
                    </Link>
                </div>
            </section>

            {/* Featured */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-3">Los Elegidos 🔥</h2>
                    <p className="text-stone-500">Nuestros productos más vendidos del mes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {productsWithImage.filter(p => p.featured).map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* About Snippet */}
            <section className="bg-[#1a1a1a] text-white py-24">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-serif font-bold mb-6 text-[#D4A373]">{aboutTitle}</h2>
                        <p className="text-stone-300 leading-relaxed mb-6">
                            {aboutText}
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3"><ShieldCheck className="text-[#D4A373]" /> Calidad Premium Garantizada</li>
                            <li className="flex items-center gap-3"><Truck className="text-[#D4A373]" /> Envíos a todo el país</li>
                            <li className="flex items-center gap-3"><CreditCard className="text-[#D4A373]" /> 3 y 6 Cuotas Sin Interés</li>
                        </ul>
                        <Link href="/shop" passHref>
                            <Button variant="secondary">Conocé más</Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src={aboutImage1} className="rounded-lg mt-8 w-full h-full object-cover" alt="Mate detalle" />
                        <img src={aboutImage2} className="rounded-lg w-full h-full object-cover" alt="Taller" />
                    </div>
                </div>
            </section>

            {/* Reviews */}
            <section className="py-20 px-6 max-w-5xl mx-auto text-center">
                <h2 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-12">Lo que dicen nuestros clientes</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {REVIEWS.map(r => (
                        <div key={r.id} className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                            <div className="flex justify-center gap-1 mb-4">
                                {[...Array(r.stars)].map((_, i) => <Star key={i} size={16} className="fill-[#8B5A2B] text-[#8B5A2B]" />)}
                            </div>
                            <p className="text-stone-600 italic mb-4">"{r.text}"</p>
                            <h4 className="font-bold text-[#1a1a1a]">{r.user}</h4>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
