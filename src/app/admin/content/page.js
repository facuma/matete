'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Save, Upload, X } from 'lucide-react';

export default function AdminContentPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        heroTitle: '',
        heroSubtitle: '',
        heroButtonText: '',
        heroImage: '',
        aboutTitle: '',
        aboutText: '',
        aboutImage1: '',
        aboutImage2: ''
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await fetch('/api/content/home');
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    heroTitle: data.heroTitle || '',
                    heroSubtitle: data.heroSubtitle || '',
                    heroButtonText: data.heroButtonText || '',
                    heroImage: data.heroImage || '',
                    aboutTitle: data.aboutTitle || '',
                    aboutText: data.aboutText || '',
                    aboutImage1: data.aboutImage1 || '',
                    aboutImage2: data.aboutImage2 || ''
                });
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formDataUpload
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, [fieldName]: data.imageUrl }));
            } else {
                alert('Error al subir imagen');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir imagen');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/content/home', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Contenido actualizado correctamente');
            } else {
                alert('Error al guardar cambios');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-800">Editar Home</h1>
                <Button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2">
                    <Save size={20} />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Hero Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h2 className="text-xl font-bold text-[#8B5A2B] mb-6 border-b pb-2">Sección Principal (Hero)</h2>
                    <div className="grid gap-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Título Principal</label>
                            <input
                                type="text"
                                name="heroTitle"
                                value={formData.heroTitle}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Subtítulo</label>
                            <input
                                type="text"
                                name="heroSubtitle"
                                value={formData.heroSubtitle}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Texto del Botón</label>
                            <input
                                type="text"
                                name="heroButtonText"
                                value={formData.heroButtonText}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>

                        {/* Hero Image */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">Imagen de Fondo</label>
                            <div className="flex items-start gap-4">
                                <div className="w-40 h-24 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative">
                                    {formData.heroImage ? (
                                        <>
                                            <img src={formData.heroImage} alt="Hero" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, heroImage: '' }))}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-stone-400">Sin imagen</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="heroImage"
                                        value={formData.heroImage}
                                        onChange={handleChange}
                                        placeholder="URL de la imagen"
                                        className="w-full p-2 border rounded-lg mb-2 text-sm"
                                    />
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm transition-colors">
                                        <Upload size={16} />
                                        Subir Archivo
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'heroImage')} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h2 className="text-xl font-bold text-[#8B5A2B] mb-6 border-b pb-2">Sección "Sobre Nosotros"</h2>
                    <div className="grid gap-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Título</label>
                            <input
                                type="text"
                                name="aboutTitle"
                                value={formData.aboutTitle}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Texto Descriptivo</label>
                            <textarea
                                name="aboutText"
                                value={formData.aboutText}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Image 1 */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Imagen 1</label>
                                <div className="flex flex-col gap-2">
                                    <div className="w-full h-40 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative">
                                        {formData.aboutImage1 ? (
                                            <>
                                                <img src={formData.aboutImage1} alt="About 1" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, aboutImage1: '' }))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-stone-400">Sin imagen</div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="aboutImage1"
                                        value={formData.aboutImage1}
                                        onChange={handleChange}
                                        placeholder="URL de la imagen"
                                        className="w-full p-2 border rounded-lg text-sm"
                                    />
                                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm transition-colors">
                                        <Upload size={16} />
                                        Subir Archivo
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'aboutImage1')} />
                                    </label>
                                </div>
                            </div>

                            {/* Image 2 */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Imagen 2</label>
                                <div className="flex flex-col gap-2">
                                    <div className="w-full h-40 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative">
                                        {formData.aboutImage2 ? (
                                            <>
                                                <img src={formData.aboutImage2} alt="About 2" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, aboutImage2: '' }))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-stone-400">Sin imagen</div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="aboutImage2"
                                        value={formData.aboutImage2}
                                        onChange={handleChange}
                                        placeholder="URL de la imagen"
                                        className="w-full p-2 border rounded-lg text-sm"
                                    />
                                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm transition-colors">
                                        <Upload size={16} />
                                        Subir Archivo
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'aboutImage2')} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
