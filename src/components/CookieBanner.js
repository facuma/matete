'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Add a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-4xl">
            <div className="bg-white/95 backdrop-blur-sm border border-stone-200 shadow-xl rounded-full p-3 px-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
                <div className="text-stone-600 text-sm flex-1 text-center md:text-left">
                    <span className="mr-1">Utilizamos cookies para mejorar tu experiencia.</span>
                    <Link href="/politica-de-cookies" className="text-[#B05C3C] hover:text-[#8a4830] font-medium underline decoration-1 underline-offset-2 transition-colors">
                        Política de Cookies
                    </Link>
                </div>
                <div className="flex flex-row gap-3 md:gap-2 items-center flex-shrink-0">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full text-sm transition-all duration-200"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-5 py-1.5 bg-[#1a1a1a] text-white hover:bg-black rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
