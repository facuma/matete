'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';

const statusColors = {
  Completado: 'bg-green-100 text-green-800',
  Enviado: 'bg-blue-100 text-blue-800',
  Procesando: 'bg-amber-100 text-amber-800',
  Pagado: 'bg-emerald-100 text-emerald-800',
  Cancelado: 'bg-red-100 text-red-800',
  Pendiente: 'bg-gray-100 text-gray-800'
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modal states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== 'Todos') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });

      if (res.ok) {
        await fetchOrders();
        setIsDetailsOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Orden cancelada exitosamente. Stock restaurado: ${data.stockRestored ? 'Sí' : 'No'}`);
        await fetchOrders();
        setIsDetailsOpen(false);
        setSelectedOrder(null);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      alert('Error al cancelar la orden');
    }
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mx-auto mb-4"></div>
          <p className="text-stone-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8">Órdenes de Clientes</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por ID, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Procesando">Procesando</option>
            <option value="Pagado">Pagado</option>
            <option value="Enviado">Enviado</option>
            <option value="Completado">Completado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Desktop Orders Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-semibold text-sm">ID Orden</th>
              <th className="p-4 font-semibold text-sm">Cliente</th>
              <th className="p-4 font-semibold text-sm">Fecha</th>
              <th className="p-4 font-semibold text-sm">Total</th>
              <th className="p-4 font-semibold text-sm">Estado</th>
              <th className="p-4 font-semibold text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-stone-400">
                  {orders.length === 0 ? 'No hay órdenes registradas' : 'No se encontraron órdenes'}
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-stone-200 last:border-0 hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-stone-500">{order.id}</td>
                  <td className="p-4 font-medium text-stone-800">{order.customerName}</td>
                  <td className="p-4 text-stone-600">
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="p-4 text-stone-600">${order.total.toLocaleString('es-AR')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => openDetailsModal(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Eye size={18} />
                      <span className="text-sm font-medium">Ver Detalles</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Orders List (Card View) */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-lg shadow-sm">
            {orders.length === 0 ? 'No hay órdenes registradas' : 'No se encontraron órdenes'}
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-stone-500">#{order.id}</span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                  <h3 className="font-medium text-stone-800">{order.customerName}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-stone-50 pt-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-xs text-stone-400">Total</span>
                  <span className="font-bold text-stone-800">${order.total.toLocaleString('es-AR')}</span>
                </div>
                <button
                  onClick={() => openDetailsModal(order)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onCancelOrder={handleCancelOrder}
      />
    </div>
  );
}
