'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Package, DollarSign, Calendar } from 'lucide-react';
import CustomerDetailsModal from '@/components/admin/CustomerDetailsModal';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/admin/customers');
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (customerId) => {
        try {
            const res = await fetch(`/api/admin/customers/${customerId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedCustomer(data);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mx-auto mb-4"></div>
                    <p className="text-stone-600">Cargando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
                        <Users size={32} />
                        Clientes
                    </h1>
                    <p className="text-stone-600 mt-1">Gestiona la información de tus clientes</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-stone-500">Total Clientes</p>
                            <p className="text-3xl font-bold text-stone-800 mt-1">{customers.length}</p>
                        </div>
                        <Users className="text-blue-500" size={40} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-stone-500">Pedidos Totales</p>
                            <p className="text-3xl font-bold text-stone-800 mt-1">
                                {customers.reduce((sum, c) => sum + c.orderCount, 0)}
                            </p>
                        </div>
                        <Package className="text-green-500" size={40} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-stone-500">Facturación Total</p>
                            <p className="text-3xl font-bold text-stone-800 mt-1">
                                ${customers.reduce((sum, c) => sum + c.totalBilling, 0).toLocaleString('es-AR')}
                            </p>
                        </div>
                        <DollarSign className="text-amber-500" size={40} />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:border-stone-800 focus:ring-2 focus:ring-stone-800 outline-none"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="text-left p-4 font-semibold text-stone-700">Cliente</th>
                                <th className="text-left p-4 font-semibold text-stone-700">Email</th>
                                <th className="text-left p-4 font-semibold text-stone-700">Pedidos</th>
                                <th className="text-left p-4 font-semibold text-stone-700">Facturación</th>
                                <th className="text-left p-4 font-semibold text-stone-700">Registro</th>
                                <th className="text-left p-4 font-semibold text-stone-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 text-stone-500">
                                        No se encontraron clientes
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="border-b border-stone-200 last:border-0 hover:bg-stone-50 transition-colors">
                                        <td className="p-4 font-medium text-stone-800">{customer.name}</td>
                                        <td className="p-4 text-stone-600">{customer.email}</td>
                                        <td className="p-4 text-stone-600">
                                            <span className="inline-flex items-center gap-1">
                                                <Package size={16} />
                                                {customer.orderCount}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-green-600">
                                            ${customer.totalBilling.toLocaleString('es-AR')}
                                        </td>
                                        <td className="p-4 text-stone-600 text-sm">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(customer.createdAt).toLocaleDateString('es-AR')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleViewDetails(customer.id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Details Modal */}
            {showModal && selectedCustomer && (
                <CustomerDetailsModal
                    customer={selectedCustomer}
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedCustomer(null);
                    }}
                />
            )}
        </div>
    );
}
