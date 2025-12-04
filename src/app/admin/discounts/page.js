'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Trash2, Edit } from 'lucide-react';
import Button from '@/components/ui/Button';
import DiscountFormModal from '@/components/admin/DiscountFormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

export default function AdminDiscountsPage() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState(null);
    const [selectedDiscount, setSelectedDiscount] = useState(null);

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/discounts');
            const data = await res.json();
            setDiscounts(data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDiscount = async (discountData) => {
        try {
            const method = selectedDiscount ? 'PUT' : 'POST';
            const url = selectedDiscount ? `/api/admin/discounts/${selectedDiscount.id}` : '/api/admin/discounts';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discountData)
            });

            if (res.ok) {
                await fetchDiscounts();
                setIsFormOpen(false);
                setSelectedDiscount(null);
            } else {
                const error = await res.json();
                alert(error.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving discount:', error);
        }
    };

    const handleDeleteDiscount = async () => {
        try {
            const res = await fetch(`/api/admin/discounts/${discountToDelete.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchDiscounts();
                setIsDeleteOpen(false);
                setDiscountToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting discount:', error);
        }
    };

    const filteredDiscounts = discounts.filter(d =>
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mx-auto mb-4"></div>
                    <p className="text-stone-600">Cargando descuentos...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-800">Gestión de Descuentos</h1>
                <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={() => {
                        setSelectedDiscount(null);
                        setIsFormOpen(true);
                    }}
                >
                    <PlusCircle size={20} />
                    Nuevo Código
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                    />
                </div>
            </div>

            {/* Discounts Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="p-4 font-semibold text-sm">Código</th>
                            <th className="p-4 font-semibold text-sm">Descuento</th>
                            <th className="p-4 font-semibold text-sm">Usos</th>
                            <th className="p-4 font-semibold text-sm">Expiración</th>
                            <th className="p-4 font-semibold text-sm">Estado</th>
                            <th className="p-4 font-semibold text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDiscounts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-stone-400">
                                    No se encontraron descuentos
                                </td>
                            </tr>
                        ) : (
                            filteredDiscounts.map(discount => (
                                <tr key={discount.id} className="border-b border-stone-200 last:border-0 hover:bg-stone-50 transition-colors">
                                    <td className="p-4 font-bold text-stone-800">{discount.code}</td>
                                    <td className="p-4 text-stone-600">{discount.percentage}%</td>
                                    <td className="p-4 text-stone-600">
                                        {discount.usedCount} / {discount.usageLimit}
                                    </td>
                                    <td className="p-4 text-stone-600">
                                        {discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString() : 'Sin límite'}
                                    </td>
                                    <td className="p-4">
                                        {discount.usedCount >= discount.usageLimit ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Agotado</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Activo</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedDiscount(discount);
                                                    setIsFormOpen(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDiscountToDelete(discount);
                                                    setIsDeleteOpen(true);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
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

            <DiscountFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedDiscount(null);
                }}
                onSave={handleSaveDiscount}
                discount={selectedDiscount}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setDiscountToDelete(null);
                }}
                onConfirm={handleDeleteDiscount}
                itemName={discountToDelete?.code}
                itemType="código de descuento"
            />
        </div>
    );
}
