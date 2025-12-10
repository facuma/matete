'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageGallery from '@/components/admin/ImageGallery';

export default function ImagePicker({ onSelect, currentImage, trigger }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (url) => {
        if (onSelect) onSelect(url);
        setIsOpen(false);
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                {trigger || (
                    <Button type="button" variant="secondary" size="sm">
                        Seleccionar Imagen
                    </Button>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-stone-200">

                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-stone-900">Galería de Imágenes</h3>
                                <p className="text-sm text-stone-500">Sube, gestiona o selecciona imágenes para tu tienda</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-800"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <ImageGallery onSelect={handleSelect} currentImage={currentImage} />
                    </div>
                </div>
            )}
        </>
    );
}
