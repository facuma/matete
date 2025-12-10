'use client';

import React from 'react';
import ImageGallery from '@/components/admin/ImageGallery';

export default function AdminImagesPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-stone-800">Galería de Imágenes</h1>
                <p className="text-stone-500">Gestiona todas las imágenes de tu tienda en un solo lugar</p>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
                <ImageGallery />
            </div>
        </div>
    );
}
