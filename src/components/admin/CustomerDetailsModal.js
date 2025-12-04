'use client';

import React from 'react';
import { X, User, Mail, Package, DollarSign, MapPin, Calendar, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';

const statusColors = {
    Completado: 'bg-green-100 text-green-800',
    Enviado: 'bg-blue-100 text-blue-800',
    Procesando: 'bg-amber-100 text-amber-800',
    Cancelado: 'bg-red-100 text-red-800',
    Pendiente: 'bg-gray-100 text-gray-800'
};

export default function CustomerDetailsModal({ customer, isOpen, onClose }) {
    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                            <User size={28} />
                            Detalles del Cliente
                        </h2>
                        <p className="text-stone-600 text-sm mt-1">Información completa y historial de pedidos</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-stone-100 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                        <h3 className="font-bold text-lg text-stone-800 mb-4">Información Personal</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <User className="text-stone-500" size={20} />
                                <div>
                                    <p className="text-sm text-stone-500">Nombre</p>
                                    <p className="font-medium text-stone-800">{customer.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="text-stone-500" size={20} />
                                <div>
                                    <p className="text-sm text-stone-500">Email</p>
                                    <p className="font-medium text-stone-800">{customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="text-stone-500" size={20} />
                                <div>
                                    <p className="text-sm text-stone-500">Cliente desde</p>
                                    <p className="font-medium text-stone-800">
                                        {new Date(customer.createdAt).toLocaleDateString('es-AR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Package className="text-stone-500" size={20} />
                                <div>
                                    <p className="text-sm text-stone-500">Total de Pedidos</p>
                                    <p className="font-medium text-stone-800">{customer.orderCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing Stats */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Facturación Total</p>
                                    <p className="text-3xl font-bold text-green-800 mt-1">
                                        ${customer.totalBilling.toLocaleString('es-AR')}
                                    </p>
                                </div>
                                <DollarSign className="text-green-600" size={40} />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Promedio por Pedido</p>
                                    <p className="text-3xl font-bold text-blue-800 mt-1">
                                        ${customer.orderCount > 0 ? Math.round(customer.totalBilling / customer.orderCount).toLocaleString('es-AR') : 0}
                                    </p>
                                </div>
                                <Package className="text-blue-600" size={40} />
                            </div>
                        </div>
                    </div>

                    {/* Orders History */}
                    <div>
                        <h3 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
                            <Package size={20} />
                            Historial de Pedidos ({customer.orders.length})
                        </h3>

                        {customer.orders.length === 0 ? (
                            <div className="bg-stone-50 p-8 rounded-xl text-center">
                                <Package size={48} className="mx-auto text-stone-300 mb-2" />
                                <p className="text-stone-600">Este cliente aún no ha realizado pedidos</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {customer.orders.map(order => (
                                    <div key={order.id} className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 pb-3 border-b border-stone-200">
                                            <div>
                                                <p className="text-sm text-stone-500">Orden #{order.id.slice(0, 8)}</p>
                                                <p className="text-sm text-stone-600 flex items-center gap-1 mt-1">
                                                    <Calendar size={14} />
                                                    {new Date(order.createdAt).toLocaleDateString('es-AR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 md:mt-0">
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-lg font-bold text-stone-800">
                                                    ${order.total.toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-1">
                                                    <MapPin size={16} />
                                                    Dirección de Envío
                                                </p>
                                                <p className="text-sm text-stone-600">{order.customerAddress}</p>
                                                <p className="text-sm text-stone-600">{order.customerCity}</p>
                                            </div>

                                            {order.paymentMethod && (
                                                <div>
                                                    <p className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-1">
                                                        <CreditCard size={16} />
                                                        Método de Pago
                                                    </p>
                                                    <p className="text-sm text-stone-600">
                                                        {order.paymentMethod === 'card' && '💳 Tarjeta'}
                                                        {order.paymentMethod === 'mercadopago' && '📱 MercadoPago'}
                                                        {order.paymentMethod === 'transfer' && '🏦 Transferencia'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-stone-200">
                                            <p className="text-sm font-semibold text-stone-700 mb-2">Productos</p>
                                            <div className="space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-stone-600">{item.quantity}x {item.name}</span>
                                                        <span className="font-medium">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-stone-50 border-t border-stone-200 p-4 flex justify-end">
                    <Button onClick={onClose} className="bg-stone-800 hover:bg-stone-700">
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
