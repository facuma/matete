'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BulkUploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    if (!isOpen) return null;

    const handleDownloadTemplate = () => {
        // Simple CSV template with Spanish headers
        const headers = [
            'Nombre (Obligatorio)',
            'Precio (Obligatorio)',
            'Categoría (Obligatorio)',
            'Descripción (Obligatorio)',
            'Stock (Obligatorio)',
            'URL Imagen',
            'Marca',
            'Precio Promocional'
        ];
        const example = [
            'Mate Imperial',
            '15000',
            'Mates',
            'Mate de calabaza forrado en cuero',
            '10',
            '',
            'Matete',
            ''
        ];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + example.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "plantilla_productos_matete.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            setError('Por favor sube un archivo CSV válido.');
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError(null);
        setSuccess(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/products/bulk', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al procesar el archivo');
            }

            setSuccess(`Se importaron ${data.count} productos exitosamente.`);
            setTimeout(() => {
                onUploadSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <Upload size={20} />
                        Carga Masiva
                    </h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                        <h3 className="font-medium text-stone-800 mb-2 flex items-center gap-2">
                            <FileText size={16} />
                            Instrucciones
                        </h3>
                        <p className="text-sm text-stone-600 mb-3">
                            1. Descarga la plantilla CSV.<br />
                            2. Completa los campos.<br />
                            3. Para múltiples imágenes, sepáralas con punto y coma (;).<br />
                            4. Guarda el archivo como .csv y súbelo aquí.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadTemplate}
                            className="w-full flex justify-center items-center gap-2"
                        >
                            <Download size={16} />
                            Descargar Plantilla
                        </Button>
                    </div>

                    <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-stone-800 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileText size={32} className="text-stone-800 mb-2" />
                                <span className="font-medium text-stone-800 break-all">{file.name}</span>
                                <span className="text-xs text-stone-500 mt-1">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-stone-500">
                                <Upload size={32} className="mb-2" />
                                <span className="font-medium">Arrastra tu archivo aquí</span>
                                <span className="text-xs mt-1">o haz click para seleccionar (CSV)</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-start gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                            <CheckCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                        Importar Productos
                    </Button>
                </div>
            </div>
        </div>
    );
}
