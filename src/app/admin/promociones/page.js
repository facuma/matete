'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Trash2, Edit, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
// We'll implement the modal next, for now basic list
import PromotionFormModal from '@/components/admin/PromotionFormModal';

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/promotions');
            const data = await res.json();
            if (Array.isArray(data)) {
                setPromotions(data);
            } else {
                console.error("API returned non-array:", data);
                setPromotions([]);
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePromotion = async (promotionData) => {
        try {
            const method = selectedPromotion ? 'PUT' : 'POST';
            // Include ID if editing
            const body = selectedPromotion ? { ...promotionData, id: selectedPromotion.id } : promotionData;

            const res = await fetch('/api/admin/promotions', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                await fetchPromotions();
                setIsFormOpen(false);
                setSelectedPromotion(null);
            } else {
                const error = await res.json();
                alert(error.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving promotion:', error);
        }
    };

    const filteredPromotions = promotions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-800">Promociones</h1>
                <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={() => setIsFormOpen(true)}
                >
                    <PlusCircle size={20} />
                    Nueva Promoción
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                    />
                </div>
            </div>

            {/* Promotions Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="p-4 font-semibold text-sm">Nombre</th>
                            <th className="p-4 font-semibold text-sm">Descuento</th>
                            <th className="p-4 font-semibold text-sm">Vigencia</th>
                            <th className="p-4 font-semibold text-sm">Estado</th>
                            <th className="p-4 font-semibold text-sm">Productos</th>
                            <th className="p-4 font-semibold text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center">Cargando...</td></tr>
                        ) : filteredPromotions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-stone-400">
                                    No se encontraron promociones
                                </td>
                            </tr>
                        ) : (
                            filteredPromotions.map(promo => (
                                <tr key={promo.id} className="border-b border-stone-200 last:border-0 hover:bg-stone-50 transition-colors">
                                    <td className="p-4 font-bold text-stone-800">{promo.name}</td>
                                    <td className="p-4 text-stone-600">{promo.discountPercentage}%</td>
                                    <td className="p-4 text-stone-600 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(promo.startDate).toLocaleDateString()}
                                            {promo.endDate && ` - ${new Date(promo.endDate).toLocaleDateString()}`}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {promo.active ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Activa</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-stone-100 text-stone-600">Inactiva</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-stone-600">
                                        {promo._count?.products || 0} productos
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedPromotion(promo);
                                                    setIsFormOpen(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <PromotionFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedPromotion(null);
                }}
                onSave={handleSavePromotion}
                promotion={selectedPromotion}
            />
        </div>
    );
}
