'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import ActivityFeed from '@/components/admin/ActivityFeed';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    newOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [metricsRes, activitiesRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch(`/api/admin/activity?page=1&limit=10`)
      ]);

      const metricsData = await metricsRes.json();
      const activitiesData = await activitiesRes.json();

      setMetrics(metricsData);
      setActivities(activitiesData.activities);
      setPagination(prev => ({
        ...prev,
        ...activitiesData.meta
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (page) => {
    try {
      setLoadingActivities(true);
      const res = await fetch(`/api/admin/activity?page=${page}&limit=10`);
      const data = await res.json();

      setActivities(data.activities);
      setPagination(prev => ({
        ...prev,
        ...data.meta
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActivities(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mx-auto mb-4"></div>
          <p className="text-stone-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Ventas Totales"
          value={`$${(metrics.totalSales || 0).toLocaleString('es-AR')}`}
          icon={DollarSign}
          color="text-green-500"
        />
        <StatCard
          title="Nuevas Órdenes"
          value={metrics.newOrders || 0}
          icon={ShoppingCart}
          color="text-blue-500"
        />
        <StatCard
          title="Productos Activos"
          value={metrics.totalProducts || 0}
          icon={Package}
          color="text-amber-500"
        />
        <StatCard
          title="Clientes Totales"
          value={metrics.totalCustomers || 0}
          icon={Users}
          color="text-violet-500"
        />
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-stone-800">Actividad Reciente</h2>
          <span className="text-sm text-stone-500">
            Total: {pagination.total}
          </span>
        </div>

        <div className={`transition-opacity duration-200 ${loadingActivities ? 'opacity-50' : 'opacity-100'}`}>
          <ActivityFeed activities={activities} />
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 border-t border-stone-100 pt-4">
            <div className="text-sm text-stone-500">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loadingActivities}
                className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft size={20} className="text-stone-600" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loadingActivities}
                className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Siguiente página"
              >
                <ChevronRight size={20} className="text-stone-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
