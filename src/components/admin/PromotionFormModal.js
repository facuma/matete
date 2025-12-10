'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Search, Check } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PromotionFormModal({ isOpen, onClose, promotion, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        discountPercentage: '',
        startDate: '',
        endDate: '',
        active: true,
        scope: 'all', // 'all' or 'specific'
        productIds: []
    });

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (promotion) {
            setFormData({
                name: promotion.name,
                discountPercentage: promotion.discountPercentage,
                startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
                endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
                active: promotion.active,
                scope: 'all', // Default to all for now, logic to determine scope from existing promo is complex without extra API data
                productIds: []
            });
            // TODO: Fetch linked products if editing to populate productIds
        } else {
            setFormData({
                name: '',
                discountPercentage: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                active: true,
                scope: 'all',
                productIds: []
            });
        }
    }, [promotion, isOpen]);

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...formData,
                discountPercentage: Number(formData.discountPercentage),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleProduct = (productId) => {
        setFormData(prev => {
            const exists = prev.productIds.includes(productId);
            if (exists) {
                return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
            } else {
                return { ...prev, productIds: [...prev.productIds, productId] };
            }
        });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-800">
                        {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
                    </h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre de la Promoción</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                placeholder="Ej: Sale de Invierno"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Porcentaje de Descuento (%)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                    placeholder="20"
                                    value={formData.discountPercentage}
                                    onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Estado</label>
                                <select
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                    value={formData.active ? 'active' : 'inactive'}
                                    onChange={e => setFormData({ ...formData, active: e.target.value === 'active' })}
                                >
                                    <option value="active">Activa</option>
                                    <option value="inactive">Inactiva</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Fecha Inicio</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Fecha Fin (Opcional)</label>
                                <input
                                    type="date"
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-stone-100 pt-6">
                        <label className="block text-sm font-medium text-stone-700 mb-4">Aplicar a:</label>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={formData.scope === 'all'}
                                    onChange={() => setFormData({ ...formData, scope: 'all' })}
                                    className="accent-[#1a1a1a]"
                                />
                                <span>Todos los productos</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={formData.scope === 'specific'}
                                    onChange={() => setFormData({ ...formData, scope: 'specific' })}
                                    className="accent-[#1a1a1a]"
                                />
                                <span>Productos específicos</span>
                            </label>
                        </div>

                        {formData.scope === 'specific' && (
                            <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar productos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 rounded-md border border-stone-200 text-sm focus:border-[#1a1a1a] outline-none"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {loadingProducts ? (
                                        <div className="text-center py-4 text-stone-500 text-sm">Cargando productos...</div>
                                    ) : (
                                        filteredProducts.map(product => (
                                            <div
                                                key={product.id}
                                                onClick={() => toggleProduct(product.id)}
                                                className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm ${formData.productIds.includes(product.id)
                                                        ? 'bg-stone-200 text-stone-800 font-medium'
                                                        : 'hover:bg-stone-100 text-stone-600'
                                                    }`}
                                            >
                                                <span>{product.name}</span>
                                                {formData.productIds.includes(product.id) && <Check size={14} />}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="mt-2 text-xs text-stone-500 text-right">
                                    {formData.productIds.length} productos seleccionados
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2"
                        type="submit"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Guardar Promoción
                    </Button>
                </div>
            </div>
        </div>
    );
}
