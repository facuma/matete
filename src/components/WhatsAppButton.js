'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

import { usePathname } from 'next/navigation';

export default function WhatsAppButton({ productName = null, productUrl = null }) {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Check if we are on a product detail page
    const isProductPage = pathname?.startsWith('/productos/');

    // Get WhatsApp number from environment variable
    // Default to a placeholder that user needs to replace
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493624000000';

    useEffect(() => {
        // Show button after a short delay for better UX
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const getMessage = () => {
        if (productName && productUrl) {
            return `Hola! Tengo una consulta sobre el producto: ${productName}. ${productUrl}`;
        }
        return 'Hola! Tengo una consulta sobre los productos de MATETÉ.';
    };

    const handleClick = () => {
        const message = encodeURIComponent(getMessage());
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-50 ${isProductPage ? 'hidden md:block' : ''}`}>
            {/* Tooltip/Message bubble */}
            {isExpanded && (
                <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl border border-stone-200 p-4 w-64 animate-fade-in">
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-2 right-2 text-stone-400 hover:text-stone-600"
                    >
                        <X size={16} />
                    </button>
                    <p className="text-sm text-stone-700 mb-3">
                        ¿Tienes alguna duda? ¡Escríbenos por WhatsApp!
                    </p>
                    <button
                        onClick={handleClick}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                        Iniciar conversación
                    </button>
                </div>
            )}

            {/* Main WhatsApp Button */}
            <button
                onClick={handleClick}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
                aria-label="Contactar por WhatsApp"
            >
                <MessageCircle size={28} className="animate-pulse-slow" />

                {/* Pulse effect */}
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
            </button>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
