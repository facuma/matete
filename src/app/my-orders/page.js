'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, Calendar, CreditCard, MapPin } from 'lucide-react';
import Link from 'next/link';

const statusColors = {
    Completado: 'bg-green-100 text-green-800',
    Enviado: 'bg-blue-100 text-blue-800',
    Procesando: 'bg-amber-100 text-amber-800',
    Cancelado: 'bg-red-100 text-red-800',
    Pendiente: 'bg-gray-100 text-gray-800'
};

export default function MyOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/my-orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mx-auto mb-4"></div>
                        <p className="text-stone-600">Cargando tus pedidos...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-2">Mis Pedidos</h1>
            <p className="text-stone-600 mb-8">Historial de tus compras en Mateté</p>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                    <Package size={64} className="mx-auto text-stone-300 mb-4" />
                    <h2 className="text-xl font-bold text-stone-800 mb-2">No tienes pedidos aún</h2>
                    <p className="text-stone-600 mb-6">¡Explora nuestra tienda y haz tu primera compra!</p>
                    <Link
                        href="/shop"
                        className="inline-block bg-[#1a1a1a] text-white px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors"
                    >
                        Ir a la Tienda
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-stone-200">
                                <div>
                                    <p className="text-sm text-stone-500">Orden #{order.id.slice(0, 8)}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar size={16} className="text-stone-400" />
                                        <p className="text-sm text-stone-600">
                                            {new Date(order.createdAt).toLocaleDateString('es-AR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                                        <Package size={18} />
                                        Productos
                                    </h3>
                                    <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-stone-600">{item.quantity}x {item.name}</span>
                                                <span className="font-medium">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                                        <MapPin size={18} />
                                        Dirección de Envío
                                    </h3>
                                    <p className="text-sm text-stone-600">{order.customerAddress}</p>
                                    <p className="text-sm text-stone-600">{order.customerCity}</p>

                                    {order.paymentMethod && (
                                        <div className="mt-3">
                                            <h3 className="font-semibold text-stone-800 mb-1 flex items-center gap-2">
                                                <CreditCard size={18} />
                                                Método de Pago
                                            </h3>
                                            <p className="text-sm text-stone-600">
                                                {order.paymentMethod === 'card' && '💳 Tarjeta'}
                                                {order.paymentMethod === 'mercadopago' && '📱 MercadoPago'}
                                                {order.paymentMethod === 'transfer' && '🏦 Transferencia'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                                <span className="text-stone-600">Total</span>
                                <span className="text-2xl font-bold text-[#1a1a1a]">${order.total.toLocaleString('es-AR')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
