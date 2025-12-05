'use client';

import React from 'react';
import { FileText } from 'lucide-react';

export default function LegalLayout({ title, lastUpdated, children }) {
    return (
        <div className="min-h-screen bg-stone-50">
            <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-stone-800" size={32} />
                        <h1 className="text-4xl font-serif font-bold text-[#1a1a1a]">
                            {title}
                        </h1>
                    </div>
                    {lastUpdated && (
                        <p className="text-sm text-stone-500">
                            Última actualización: {lastUpdated}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 md:p-12">
                    <div className="prose prose-stone max-w-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
