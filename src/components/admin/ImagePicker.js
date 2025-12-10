'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check, Loader2, Trash2, Link as LinkIcon, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ImagePicker({ onSelect, currentImage, trigger }) {
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Initial load
    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen]);

    const fetchImages = async () => {
        setLoadingImages(true);
        try {
            const res = await fetch('/api/admin/upload');
            if (res.ok) {
                const data = await res.json();
                setImages(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error cargando librería");
        } finally {
            setLoadingImages(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadFile(file);
    };

    const uploadFile = async (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                // Add new image to start of list
                const newImage = {
                    name: data.imageUrl.split('/').pop(),
                    url: data.imageUrl,
                    created_at: new Date().toISOString()
                };
                setImages(prev => [newImage, ...prev]);
                toast.success("Imagen subida");
            } else {
                toast.error("Error al subir imagen");
            }
        } catch (error) {
            toast.error("Error al subir imagen");
        } finally {
            setUploading(false);
            setDragActive(false);
        }
    };

    const handleDelete = async (e, filename) => {
        e.stopPropagation(); // prevent selection when clicking delete
        if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

        // Optimistic update
        setImages(prev => prev.filter(img => img.name !== filename));

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            });

            if (!res.ok) {
                throw new Error("Failed to delete");
            }
            toast.success("Imagen eliminada");
        } catch (error) {
            toast.error("Error eliminando imagen");
            fetchImages(); // Revert on error
        }
    };

    const handleUrlSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!urlInput) return;
        onSelect(urlInput);
        setIsOpen(false);
        toast.success("Imagen seleccionada por URL");
    };

    // Drag & Drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
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

                        <div className="flex-1 overflow-y-auto bg-stone-50/50 p-6">

                            {/* Top Tools Section: Upload & URL */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Drag & Drop Upload */}
                                <div
                                    className={cn(
                                        "md:col-span-2 relative flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-xl transition-all cursor-pointer bg-white group",
                                        dragActive ? "border-[#8B5A2B] bg-[#8B5A2B]/5 scale-[0.99]" : "border-stone-200 hover:border-[#8B5A2B]/50 hover:bg-stone-50"
                                    )}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="text-center p-6 space-y-3 pointer-events-none">
                                        <div className={cn(
                                            "w-14 h-14 rounded-full flex items-center justify-center mx-auto transition-colors",
                                            dragActive ? "bg-[#8B5A2B]/20 text-[#8B5A2B]" : "bg-stone-100 text-stone-400 group-hover:bg-[#8B5A2B]/10 group-hover:text-[#8B5A2B]"
                                        )}>
                                            {uploading ? <Loader2 className="animate-spin w-6 h-6" /> : <Upload className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-stone-900 text-lg">Suelta tu imagen aquí</p>
                                            <p className="text-sm text-stone-500 mt-1">o haz click para explorar tus archivos</p>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-20 backdrop-blur-sm">
                                            <div className="text-center">
                                                <Loader2 className="animate-spin w-8 h-8 text-[#8B5A2B] mx-auto mb-2" />
                                                <p className="text-[#8B5A2B] font-medium font-mono text-sm">SUBIENDO...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* URL Input */}
                                <div className="md:col-span-1 bg-white rounded-xl border border-stone-200 p-6 flex flex-col justify-center shadow-sm">
                                    <h4 className="font-semibold text-stone-900 flex items-center gap-2 mb-4">
                                        <LinkIcon size={18} />
                                        Imagen externa
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">URL de la imagen</label>
                                            <input
                                                type="url"
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] text-sm"
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit(e)}
                                            />
                                        </div>
                                        <Button type="button" onClick={handleUrlSubmit} variant="secondary" className="w-full justify-center" disabled={!urlInput}>
                                            Usar URL
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Divider with Title */}
                            <div className="flex items-center gap-4 mb-6">
                                <h4 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                                    <ImageIcon size={20} className="text-[#8B5A2B]" />
                                    Tu Librería
                                </h4>
                                <div className="h-px bg-stone-200 flex-1"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                                        {(images.reduce((acc, img) => acc + (img.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB usados
                                    </span>
                                    <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                                        {images.length} imágenes
                                    </span>
                                </div>
                            </div>

                            {/* Gallery Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10">
                                {/* SKELETON LOADING */}
                                {loadingImages && Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden animate-pulse">
                                        <div className="w-full h-full bg-stone-200/50"></div>
                                    </div>
                                ))}

                                {/* IMAGES */}
                                {!loadingImages && images.map((img) => (
                                    <div
                                        key={img.name}
                                        onClick={() => {
                                            onSelect(img.url);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "group relative aspect-square rounded-xl overflow-hidden border cursor-pointer bg-white shadow-sm transition-all duration-300",
                                            currentImage === img.url
                                                ? "ring-4 ring-[#8B5A2B]/30 border-[#8B5A2B]"
                                                : "border-stone-200 hover:border-[#8B5A2B]/50 hover:shadow-lg hover:-translate-y-1"
                                        )}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Selected Badge */}
                                        {currentImage === img.url && (
                                            <div className="absolute top-2 right-2 bg-[#8B5A2B] text-white rounded-full p-1.5 shadow-lg z-20 scale-100 animate-in zoom-in duration-200">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}

                                        {/* Actions (Hover) */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex gap-2">
                                            <button
                                                onClick={(e) => handleDelete(e, img.name)}
                                                className="bg-white/90 hover:bg-red-50 text-stone-600 hover:text-red-500 p-2 rounded-full shadow-md backdrop-blur-sm transition-colors"
                                                title="Eliminar imagen"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="absolute bottom-3 left-3 right-3 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            {new Date(img.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}

                                {/* Empty State */}
                                {!loadingImages && images.length === 0 && (
                                    <div className="col-span-full py-20 text-center">
                                        <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ImageIcon size={32} />
                                        </div>
                                        <p className="text-stone-500 font-medium">Tu librería está vacía</p>
                                        <p className="text-stone-400 text-sm mt-1">Sube imágenes para verlas aquí</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
