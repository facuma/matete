'use client';

import React from 'react';
import { ShieldCheck, Truck, CreditCard, Star, Clock, Heart, Gift, Coffee } from 'lucide-react';

const IconMap = {
    ShieldCheck, Truck, CreditCard, Star, Clock, Heart, Gift, Coffee
};

export default function FeaturesGrid({ data }) {
    const items = data?.items || [];

    if (!items || items.length === 0) return null;

    return (
        <section className="py-12 bg-stone-50 border-b border-stone-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-wrap justify-center gap-8">
                    {items.map((item, idx) => {
                        const Icon = IconMap[item.icon] || ShieldCheck;
                        return (
                            <div key={idx} className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow rounded-lg bg-white border border-stone-100">
                                <div className="p-3 rounded-full bg-[#8B5A2B]/10 text-[#8B5A2B]">
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-800 text-sm">{item.title}</h3>
                                    <p className="text-xs text-stone-500">{item.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
