'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function HeroSlider({ data }) {
    const slides = data?.slides || [];

    // Fallback if no slides
    if (!slides || slides.length === 0) {
        return (
            <section className="relative h-[60vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
                <div className="text-center text-white">
                    <h1 className="text-5xl font-bold">MATETÉ</h1>
                    <p className="mt-4">El ritual de cada día</p>
                </div>
            </section>
        );
    }

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));

    return (
        <section className="relative h-[60vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-black group">
            {slides.map((slide, idx) => (
                <div
                    key={slide.id || idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={slide.image || '/placeholder-hero.jpg'} alt={slide.title} className="w-full h-full object-cover brightness-50" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                        <h1 className="text-4xl md:text-7xl font-serif font-bold mb-6 leading-tight animate-[fadeInUp_1s] max-w-4xl drop-shadow-lg">
                            {slide.title}
                        </h1>
                        <span className="text-[#D4A373] font-medium tracking-widest uppercase mb-4 animate-[fadeInDown_1s] block">{slide.subtitle}</span>
                        {slide.ctaText && (
                            <Link href={slide.link || '/shop'} className="animate-[fadeInUp_1.5s]">
                                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">{slide.ctaText}</Button>
                            </Link>
                        )}
                    </div>
                </div>
            ))}

            {slides.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-4 z-20 text-white/50 hover:text-white p-2 rounded-full border border-white/20 hover:border-white transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={32} /></button>
                    <button onClick={nextSlide} className="absolute right-4 z-20 text-white/50 hover:text-white p-2 rounded-full border border-white/20 hover:border-white transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={32} /></button>
                </>
            )}
        </section>
    );
}
