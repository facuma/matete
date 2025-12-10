'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BlogGallery({ data }) {
    if (!data?.posts || data.posts.length === 0) return null;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
                        {data.title || 'Novedades'}
                    </h2>
                    {data.subtitle && (
                        <p className="text-stone-600">
                            {data.subtitle}
                        </p>
                    )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {data.posts.map((post, idx) => (
                        <Link
                            key={idx}
                            href={post.link || '#'}
                            className="group flex flex-col bg-white rounded-xl overflow-hidden border border-stone-100 hover:shadow-xl transition-all duration-300"
                        >
                            {/* Image */}
                            <div className="aspect-[4/3] overflow-hidden bg-stone-100 relative">
                                {post.image ? (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                        <span className="text-4xl">📝</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-[#8B5A2B] transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-stone-500 text-sm mb-6 flex-1 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center text-[#8B5A2B] font-bold text-sm mt-auto">
                                    Leer nota <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
