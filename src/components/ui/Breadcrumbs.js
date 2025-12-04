'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items }) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-stone-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
            <Link href="/" className="hover:text-[#8B5A2B] transition-colors flex items-center gap-1">
                <Home size={14} />
                <span>Inicio</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <ChevronRight size={14} className="text-stone-300" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-[#8B5A2B] transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-[#1a1a1a] font-medium cursor-default">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
