'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ProductFormModal({ isOpen, onClose, product, onSave, allProducts = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        promotionalPrice: '',
        category: 'Mates',
        description: '',
        imageUrl: '',
        featured: false,
        rating: 5,
        options: [],
        slug: '',
        metaTitle: '',
        metaDescription: ''
    });
    const [uploading, setUploading] = useState(false);
    const [inputType, setInputType] = useState('upload'); // 'upload' or 'url'
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [currentOptionIndex, setCurrentOptionIndex] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                promotionalPrice: product.promotionalPrice || '',
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                options: product.options || [],
                slug: product.slug || '',
                metaTitle: product.metaTitle || '',
                metaDescription: product.metaDescription || ''
            });
        } else {
            setFormData({
                name: '',
                price: '',
                promotionalPrice: '',
                category: 'Mates',
                description: '',
                imageUrl: '',
                featured: false,
                rating: 5,
                rating: 5,
                options: [],
                slug: '',
                metaTitle: '',
                metaDescription: ''
            });
        }
    }, [product, isOpen]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: data
            });

            if (!res.ok) throw new Error('Upload failed');

            const { imageUrl } = await res.json();
            setFormData(prev => ({ ...prev, imageUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleProductSelect = (selectedProduct) => {
        if (currentOptionIndex === null) return;

        const newOptions = [...formData.options];
        newOptions[currentOptionIndex].values.push({
            name: selectedProduct.name,
            priceModifier: selectedProduct.price,
            linkedProductId: selectedProduct.id
        });
        setFormData({ ...formData, options: newOptions });
        setShowProductSelector(false);
        setProductSearch('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                <div className="p-6 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-stone-800">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="hover:bg-stone-100 p-2 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                            Nombre del Producto *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                            placeholder="Ej: Mate Imperial Premium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                Precio Regular *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                                placeholder="45000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                Precio Promocional <span className="text-xs text-stone-400 font-normal">(Opcional)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.promotionalPrice}
                                onChange={(e) => setFormData({ ...formData, promotionalPrice: e.target.value })}
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                                placeholder="Ej: 39990"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                Categoría *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                            >
                                <option value="Mates">Mates</option>
                                <option value="Bombillas">Bombillas</option>
                                <option value="Yerbas">Yerbas</option>
                                <option value="Accesorios">Accesorios</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                            placeholder="Descripción detallada del producto..."
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                        <label className="block text-sm font-medium text-stone-700 mb-3">
                            Imagen del Producto
                        </label>

                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setInputType('upload')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${inputType === 'upload'
                                    ? 'bg-stone-800 text-white'
                                    : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                                    }`}
                            >
                                <Upload size={16} /> Subir Archivo
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('url')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${inputType === 'url'
                                    ? 'bg-stone-800 text-white'
                                    : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                                    }`}
                            >
                                <LinkIcon size={16} /> URL Externa
                            </button>
                        </div>

                        {inputType === 'upload' ? (
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="secondary"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
                                </Button>
                                <span className="text-sm text-stone-500">
                                    {uploading ? 'Procesando...' : 'JPG, PNG, WEBP'}
                                </span>
                            </div>
                        ) : (
                            <input
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                        )}

                        {/* Image Preview */}
                        {formData.imageUrl && (
                            <div className="mt-4 relative w-32 h-32 border border-stone-200 rounded-lg overflow-hidden bg-white">
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full hover:bg-white text-red-500"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                Rating
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-8">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={formData.featured}
                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                className="w-4 h-4 rounded border-stone-300"
                            />
                            <label htmlFor="featured" className="text-sm font-medium text-stone-700">
                                Producto Destacado
                            </label>
                        </div>
                    </div>

                    {/* SEO Section */}
                    <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                        <h3 className="text-lg font-bold text-stone-800 mb-4">Configuración SEO</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Slug (URL) <span className="text-xs text-stone-400 font-normal">(Dejar vacío para generar automáticamente)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                                    placeholder="ej: mate-imperial-premium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Meta Título
                                </label>
                                <input
                                    type="text"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                                    placeholder="Título para buscadores"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Meta Descripción
                                </label>
                                <textarea
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                    rows={2}
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                                    placeholder="Descripción breve para buscadores..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Options & Upsells Section */}
                    <div className="border-t border-stone-200 pt-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-stone-800">Opciones y Adicionales</h3>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormData(prev => ({
                                    ...prev,
                                    options: [...(prev.options || []), { name: '', values: [] }]
                                }))}
                                className="text-sm bg-black py-1"
                            >
                                + Agregar Opción
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {formData.options?.map((option, optIndex) => (
                                <div key={optIndex} className="bg-stone-50 p-4 rounded-lg border border-stone-200 relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newOptions = [...formData.options];
                                            newOptions.splice(optIndex, 1);
                                            setFormData({ ...formData, options: newOptions });
                                        }}
                                        className="absolute top-2 right-2 text-stone-400 hover:text-red-500"
                                    >
                                        <X size={16} />
                                    </button>

                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombre de la Opción</label>
                                        <input
                                            type="text"
                                            value={option.name}
                                            onChange={(e) => {
                                                const newOptions = [...formData.options];
                                                newOptions[optIndex].name = e.target.value;
                                                setFormData({ ...formData, options: newOptions });
                                            }}
                                            placeholder="Ej: Bombilla, Caja de Regalo"
                                            className="w-full p-2 rounded border border-stone-300 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-stone-500 uppercase">Valores</label>
                                        {option.values?.map((val, valIndex) => (
                                            <div key={valIndex} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={val.name}
                                                    onChange={(e) => {
                                                        const newOptions = [...formData.options];
                                                        newOptions[optIndex].values[valIndex].name = e.target.value;
                                                        setFormData({ ...formData, options: newOptions });
                                                    }}
                                                    placeholder="Nombre (Ej: Pico de Loro)"
                                                    className="flex-grow p-2 rounded border border-stone-300 text-sm"
                                                />
                                                <div className="relative w-32">
                                                    <span className="absolute left-2 top-2 text-stone-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={val.priceModifier}
                                                        onChange={(e) => {
                                                            const newOptions = [...formData.options];
                                                            newOptions[optIndex].values[valIndex].priceModifier = e.target.value;
                                                            setFormData({ ...formData, options: newOptions });
                                                        }}
                                                        placeholder="Extra"
                                                        className="w-full p-2 pl-6 rounded border border-stone-300 text-sm"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newOptions = [...formData.options];
                                                        newOptions[optIndex].values.splice(valIndex, 1);
                                                        setFormData({ ...formData, options: newOptions });
                                                    }}
                                                    className="text-stone-400 hover:text-red-500 p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newOptions = [...formData.options];
                                                    newOptions[optIndex].values.push({ name: '', priceModifier: 0 });
                                                    setFormData({ ...formData, options: newOptions });
                                                }}
                                                className="text-xs text-[#8B5A2B] font-medium hover:underline"
                                            >
                                                + Agregar Valor Manual
                                            </button>
                                            <span className="text-stone-300">|</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrentOptionIndex(optIndex);
                                                    setShowProductSelector(true);
                                                }}
                                                className="text-xs text-stone-600 font-medium hover:underline flex items-center gap-1"
                                            >
                                                <LinkIcon size={12} /> Vincular Producto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!formData.options || formData.options.length === 0) && (
                                <p className="text-sm text-stone-500 italic text-center py-4">
                                    No hay opciones configuradas. Agrega una para ofrecer variantes o adicionales.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" variant="primary" className="flex-1">
                            {product ? 'Guardar Cambios' : 'Crear Producto'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                    </div>
                </form>

                {/* Product Selector Modal */}
                {showProductSelector && (
                    <div className="absolute inset-0 bg-white z-20 flex flex-col">
                        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                            <h3 className="font-bold text-stone-800">Seleccionar Producto para Vincular</h3>
                            <button onClick={() => setShowProductSelector(false)} className="p-1 hover:bg-stone-200 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 border-b border-stone-200">
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full p-2 rounded border border-stone-300 text-sm"
                                autoFocus
                            />
                        </div>
                        <div className="flex-grow overflow-y-auto p-2">
                            {allProducts
                                .filter(p => p.id !== product?.id) // Exclude current product
                                .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                .map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleProductSelect(p)}
                                        className="w-full text-left p-3 hover:bg-stone-50 rounded-lg flex items-center gap-3 border-b border-stone-100 last:border-0"
                                    >
                                        <div className="w-10 h-10 bg-stone-100 rounded overflow-hidden flex-shrink-0">
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-full h-full p-2 text-stone-300" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-stone-800">{p.name}</p>
                                            <p className="text-xs text-stone-500">${p.price.toLocaleString('es-AR')}</p>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
