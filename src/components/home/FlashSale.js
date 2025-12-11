'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { ProductCard } from '@/components/organisms/ProductCard';

export default function FlashSale({ data, products = [], transferDiscount = 0 }) {
    if (!data?.enabled || !data.endTime) return null;

    // Calculate Time Left
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTime = () => {
            const end = new Date(data.endTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;
            setTimeLeft(diff > 0 ? diff : 0);
        };
        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [data.endTime]);

    if (timeLeft <= 0) return null; // Deal expired

    // Format Time
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Filter Products
    // If no productIds specified, maybe show none or all? Better safe: show selected only.
    const dealProducts = products.filter(p => data.productIds?.includes(p.id));

    if (dealProducts.length === 0) return null;

    return (
        <section className="py-20 text-white relative overflow-hidden">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('${data.backgroundImage || '/flash-bg.png'}')`,
                    backgroundSize: 'cover',
                    filter: 'brightness(0.9)'
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="md:w-1/2">
                        <div className="flex items-center gap-2 mb-3 text-[#D4A373] uppercase tracking-wider text-xs font-bold bg-black/80 backdrop-blur-md px-3 py-1 rounded-full w-fit shadow-lg border border-white/10">
                            <Clock size={14} /> Oferta Limitada
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg mb-2">
                            {data.title || 'Flash Deals'} <span className="text-[#D4A373]">⚡️</span>
                        </h2>
                        <p className="text-white/90 font-medium drop-shadow-md">
                            {data.subtitle || 'Aprovechás estos descuentos exclusivos por tiempo limitado.'}
                        </p>
                    </div>

                    <div className="flex gap-3 text-center">
                        {[
                            { val: days, label: 'DÍAS' }, { val: hours, label: 'HS' }, { val: minutes, label: 'MIN' }, { val: seconds, label: 'SEG' }
                        ].map((t, i) => (
                            <div key={i} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 min-w-[80px] flex flex-col items-center shadow-lg">
                                <span className="text-3xl font-bold block text-white font-mono">
                                    {t.val.toString().padStart(2, '0')}
                                </span>
                                <span className="text-[10px] text-white/70 tracking-widest mt-1">{t.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-4 md:gap-6 pb-6 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                    {dealProducts.map(p => (
                        <div key={p.id} className="min-w-[70vw] md:min-w-0 snap-center transform hover:-translate-y-1 transition-transform h-full">
                            <ProductCard
                                product={p}
                                transferDiscount={transferDiscount}
                                className="shadow-2xl border border-white/50 ring-1 ring-black/5"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
