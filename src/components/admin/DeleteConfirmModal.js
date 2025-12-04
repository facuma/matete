'use client';

import React from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, itemType = 'elemento' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-stone-800">Confirmar Eliminación</h2>
                    <button onClick={onClose} className="hover:bg-stone-100 p-1 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-stone-600 mb-6">
                    ¿Estás seguro que deseas eliminar <strong>{itemName}</strong>? Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        Eliminar
                    </Button>
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
}
