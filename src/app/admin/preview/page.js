'use client';

import React, { useEffect, useState } from 'react';
import HomePageClient from '@/components/HomePageClient';

export default function AdminPreviewPage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        // Listen for data from parent (Page Builder)
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'UPDATE_PREVIEW') {
                setData(event.data.payload);
            }
        };

        window.addEventListener('message', handleMessage);

        // Notify parent we are ready
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-stone-400 text-sm">
                Esperando cambios...
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Mock Header for context */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-white sticky top-0 z-50">
                <span className="font-serif font-bold text-[#8B5A2B]">MATETÉ</span>
                <div className="flex gap-2">
                    <div className="w-6 h-6 bg-stone-100 rounded-full"></div>
                    <div className="w-6 h-6 bg-stone-100 rounded-full"></div>
                </div>
            </div>

            <HomePageClient
                content={{ sections: data.sections, disableInteraction: true }}
                products={data.products || []}
            />
        </div>
    );
}
