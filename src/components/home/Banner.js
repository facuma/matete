'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Banner({ data }) {
    if (!data?.image) return null;

    return (
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
            <img src={data.image} alt={data.title || "Banner"} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center">
                <div className="max-w-xl">
                    {data.title && (
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 drop-shadow-md">
                            {data.title}
                        </h2>
                    )}
                    {data.link && (
                        <Link href={data.link}>
                            <Button className="bg-white text-black hover:bg-stone-200">
                                {data.buttonText || "Ver Campaña"}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
