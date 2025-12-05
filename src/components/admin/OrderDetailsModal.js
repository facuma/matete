'use client';

import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import Button from '@/components/ui/Button';

const statusColors = {
    'Procesando': 'bg-amber-100 text-amber-800',
    'Pendiente': 'bg-gray-100 text-gray-800',
    'Pagado': 'bg-green-100 text-green-800',
    'Enviado': 'bg-blue-100 text-blue-800',
    'Completado': 'bg-emerald-100 text-emerald-800',
    'Cancelado': 'bg-red-100 text-red-800'
};

export default function OrderDetailsModal({ isOpen, onClose, order, onStatusChange, onCancelOrder }) {
    const [newStatus, setNewStatus] = useState(order?.status || 'Procesando');
    const [canceling, setCanceling] = useState(false);

    if (!isOpen || !order) return null;

    const handleStatusUpdate = () => {
        if (newStatus !== order.status) {
            onStatusChange(order.id, newStatus);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm('¿Estás seguro de cancelar esta orden? Esta acción no se puede deshacer.')) {
            return;
        }

        setCanceling(true);
        try {
            await onCancelOrder(order.id);
        } finally {
            setCanceling(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-stone-800">Detalles de Orden</h2>
                    <button onClick={onClose} className="hover:bg-stone-100 p-2 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-stone-500">ID de Orden</p>
                            <p className="font-mono font-bold text-stone-800">{order.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-stone-500">Fecha</p>
                            <p className="font-medium text-stone-800">
                                {new Date(order.createdAt).toLocaleDateString('es-AR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-stone-50 p-4 rounded-lg">
                        <h3 className="font-bold text-stone-800 mb-3">Información del Cliente</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-stone-500">Nombre</p>
                                <p className="font-medium text-stone-800">{order.customerName}</p>
                            </div>
                            {order.customerEmail && (
                                <div>
                                    <p className="text-sm text-stone-500">Email</p>
                                    <p className="font-medium text-stone-800">{order.customerEmail}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-stone-500">Dirección</p>
                                <p className="font-medium text-stone-800">{order.customerAddress}</p>
                            </div>
                            <div>
                                <p className="text-sm text-stone-500">Ciudad</p>
                                <p className="font-medium text-stone-800">{order.customerCity}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {order.paymentMethod && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-bold text-stone-800 mb-3">Información de Pago</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-stone-500">Método de Pago</p>
                                    <p className="font-medium text-stone-800">
                                        {order.paymentMethod === 'card' && '💳 Tarjeta de Crédito/Débito'}
                                        {order.paymentMethod === 'mercadopago' && '📱 MercadoPago'}
                                        {order.paymentMethod === 'transfer' && '🏦 Transferencia Bancaria'}
                                    </p>
                                </div>
                                {order.paymentDetails && (
                                    <div>
                                        <p className="text-sm text-stone-500">Detalles</p>
                                        <p className="font-medium text-stone-800">
                                            {order.paymentMethod === 'card' && order.paymentDetails.cardLast4 &&
                                                `Tarjeta terminada en ${order.paymentDetails.cardLast4}`}
                                            {order.paymentMethod === 'mercadopago' && order.paymentDetails.email &&
                                                `Email: ${order.paymentDetails.email}`}
                                            {order.paymentMethod === 'transfer' && order.paymentDetails.bank &&
                                                `${order.paymentDetails.bank} - ${order.paymentDetails.accountHolder}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div>
                        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                            <Package size={20} />
                            Productos ({order.items.length})
                        </h3>
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-stone-800">{item.name}</p>
                                        <p className="text-sm text-stone-500">Cantidad: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-stone-800">
                                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-stone-200 pt-4">
                        <div className="flex justify-between items-center text-xl font-bold">
                            <span>Total</span>
                            <span className="text-green-600">${order.total.toLocaleString('es-AR')}</span>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="border-t border-stone-200 pt-4">
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Estado de la Orden
                        </label>
                        <div className="flex gap-3">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="flex-1 p-3 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Procesando">Procesando</option>
                                <option value="Pagado">Pagado</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Completado">Completado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                            <Button
                                onClick={handleStatusUpdate}
                                disabled={newStatus === order.status}
                                variant="primary"
                            >
                                Actualizar
                            </Button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                                Estado Actual: {order.status}
                            </span>

                            {/* Cancel Order Button */}
                            {order.status !== 'Cancelado' && (
                                <Button
                                    onClick={handleCancelOrder}
                                    disabled={canceling}
                                    variant="secondary"
                                    className="bg-red-500 hover:bg-red-600 text-white text-sm"
                                >
                                    {canceling ? 'Cancelando...' : 'Cancelar Orden'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
