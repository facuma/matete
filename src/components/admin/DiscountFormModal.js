'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DiscountFormModal({ isOpen, onClose, discount, onSave }) {
    const [formData, setFormData] = useState({
        code: '',
        percentage: '',
        usageLimit: '',
        expiresAt: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (discount) {
            setFormData({
                code: discount.code,
                percentage: discount.percentage,
                usageLimit: discount.usageLimit,
                expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().split('T')[0] : ''
            });
        } else {
            setFormData({
                code: '',
                percentage: '',
                usageLimit: '',
                expiresAt: ''
            });
        }
    }, [discount, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...formData,
                percentage: Number(formData.percentage),
                usageLimit: Number(formData.usageLimit),
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-800">
                        {discount ? 'Editar Descuento' : 'Nuevo Descuento'}
                    </h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Código</label>
                        <input
                            required
                            type="text"
                            className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none uppercase"
                            placeholder="Ej: VERANO20"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Porcentaje (%)</label>
                            <input
                                required
                                type="number"
                                min="1"
                                max="100"
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                placeholder="20"
                                value={formData.percentage}
                                onChange={e => setFormData({ ...formData, percentage: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Límite de Usos</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                placeholder="100"
                                value={formData.usageLimit}
                                onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Expiración (Opcional)</label>
                        <input
                            type="date"
                            className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                            value={formData.expiresAt}
                            onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="flex items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Guardar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
