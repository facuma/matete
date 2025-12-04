'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        facebookPixelId: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    facebookPixelId: data.facebookPixelId || '',
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Configuración guardada correctamente');
            } else {
                alert('Error al guardar la configuración');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-800">Configuración</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-stone-800">Integraciones</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Facebook Pixel ID
                                </label>
                                <input
                                    type="text"
                                    name="facebookPixelId"
                                    value={formData.facebookPixelId}
                                    onChange={handleChange}
                                    placeholder="Ej: 123456789012345"
                                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-800 outline-none"
                                />
                                <p className="text-xs text-stone-500 mt-1">
                                    Ingresá el ID de tu Pixel de Meta para realizar seguimiento de eventos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-stone-100">
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex items-center gap-2"
                            disabled={loading}
                        >
                            <Save size={20} />
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
