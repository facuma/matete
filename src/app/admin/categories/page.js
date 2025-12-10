'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import CategoryFormModal from '@/components/admin/CategoryFormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async (categoryData) => {
        try {
            const method = selectedCategory ? 'PUT' : 'POST';
            const url = selectedCategory
                ? `/api/admin/categories/${selectedCategory.id}`
                : '/api/admin/categories';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(selectedCategory ? 'Categoría actualizada' : 'Categoría creada');
                await fetchCategories();
                setIsFormOpen(false);
                setSelectedCategory(null);
            } else {
                toast.error(data.error || 'Error al guardar categoría');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Error de conexión');
        }
    };

    const handleDeleteCategory = async () => {
        try {
            const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Categoría eliminada');
                await fetchCategories();
                setIsDeleteOpen(false);
                setCategoryToDelete(null);
            } else {
                toast.error(data.error || 'Error al eliminar categoría');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Error de conexión');
        }
    };

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    };

    const openCreateModal = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Categorías</h1>
                <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={openCreateModal}
                >
                    <PlusCircle size={20} />
                    Nueva Categoría
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-stone-200 font-semibold text-sm text-stone-600 flex">
                    <div className="flex-1">Nombre</div>
                    <div className="w-32 text-center">Productos</div>
                    <div className="w-32 text-center">En Navbar</div>
                    <div className="w-32 text-right">Acciones</div>
                </div>

                {categories.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">No hay categorías registradas</div>
                ) : (
                    categories.map(cat => (
                        <div key={cat.id} className="border-b border-stone-100 last:border-0">
                            <div className="p-4 flex items-center hover:bg-stone-50 transition-colors group">
                                <div className="flex-1 flex items-center gap-2">
                                    {cat.children && cat.children.length > 0 && (
                                        <button onClick={() => toggleExpand(cat.id)} className="text-stone-400 hover:text-stone-800">
                                            {expanded[cat.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </button>
                                    )}
                                    <span className="font-medium text-stone-800">{cat.name}</span>
                                </div>
                                <div className="w-32 text-center text-stone-500 text-sm">
                                    {cat._count?.products || 0}
                                </div>
                                <div className="w-32 text-center text-stone-500 text-sm">
                                    {cat.showInNavbar ? <span className="text-green-600">Sí</span> : <span className="text-stone-300">No</span>}
                                </div>
                                <div className="w-32 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => openDeleteModal(cat)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Subcategories */}
                            {expanded[cat.id] && cat.children && (
                                <div className="bg-stone-50 border-t border-stone-100">
                                    {cat.children.map(sub => (
                                        <div key={sub.id} className="p-4 pl-12 flex items-center hover:bg-stone-100 transition-colors border-b border-stone-100 last:border-0 group">
                                            <div className="flex-1 flex items-center gap-2">
                                                <span className="text-stone-600 font-normal text-sm">{sub.name}</span>
                                            </div>
                                            <div className="w-32 text-center text-stone-500 text-sm">
                                                {sub._count?.products || 0}
                                            </div>
                                            <div className="w-32 text-center text-stone-500 text-sm">
                                                {sub.showInNavbar ? <span className="text-green-600">Sí</span> : <span className="text-stone-300">No</span>}
                                            </div>
                                            <div className="w-32 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(sub)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => openDeleteModal(sub)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <CategoryFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveCategory}
                category={selectedCategory}
                rootCategories={categories} // Pass roots for parent selection
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteCategory}
                itemName={categoryToDelete?.name}
                itemType="categoría"
            />
        </div>
    );
}
