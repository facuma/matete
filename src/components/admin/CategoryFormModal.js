import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CategoryFormModal({ isOpen, onClose, onSave, category, rootCategories }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        showInNavbar: false,
        parentId: ''
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                showInNavbar: category.showInNavbar || false,
                parentId: category.parentId || ''
            });
        } else {
            setFormData({
                name: '',
                slug: '',
                showInNavbar: false,
                parentId: ''
            });
        }
    }, [category, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Auto-generate slug
    const handleNameChange = (e) => {
        const name = e.target.value;
        // Only auto-update slug if we are creating new or slug was matching previous name
        if (!category) {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, name, slug }));
        } else {
            setFormData(prev => ({ ...prev, name }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-stone-100">
                    <h2 className="text-lg font-bold text-stone-800">
                        {category ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Parent Selection */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Categoría Padre (Opcional)</label>
                        <select
                            value={formData.parentId}
                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none text-sm"
                            disabled={!!category && category.children && category.children.length > 0} // Can't move if has children (simple rule)
                        >
                            <option value="">Ninguna (Categoría Principal)</option>
                            {rootCategories
                                .filter(c => c.id !== category?.id) // Don't show self
                                .map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                        </select>
                        {category && category.children && category.children.length > 0 && (
                            <p className="text-xs text-amber-600 mt-1">No se puede cambiar padre si tiene subcategorías.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            className="w-full px-3 py-2 rounded-md border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Slug (URL)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showInNavbar"
                            checked={formData.showInNavbar}
                            onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })}
                            className="rounded text-stone-800 focus:ring-stone-800"
                        />
                        <label htmlFor="showInNavbar" className="text-sm font-medium text-stone-700 select-none cursor-pointer">
                            Mostrar en Barra de Navegación
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="primary">Guardar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
