'use client';

import React from 'react';
import { Package, ShoppingCart, Edit, Trash2, Clock } from 'lucide-react';

const activityIcons = {
    product_created: Package,
    product_updated: Edit,
    product_deleted: Trash2,
    order_created: ShoppingCart,
    order_updated: Edit
};

const activityColors = {
    product_created: 'text-green-600 bg-green-50',
    product_updated: 'text-blue-600 bg-blue-50',
    product_deleted: 'text-red-600 bg-red-50',
    order_created: 'text-purple-600 bg-purple-50',
    order_updated: 'text-amber-600 bg-amber-50'
};

function getRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-AR');
}

export default function ActivityFeed({ activities }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-stone-400">
                <Clock size={48} className="mx-auto mb-2 opacity-50" />
                <p>No hay actividad reciente</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-stone-100">
                {activities.map((activity) => {
                    const Icon = activityIcons[activity.type] || Clock;
                    const colorClass = activityColors[activity.type] || 'text-stone-600 bg-stone-50';

                    return (
                        <div key={activity.id} className="p-4 hover:bg-stone-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-stone-800">{activity.description}</p>
                                    <p className="text-xs text-stone-500 mt-1">{getRelativeTime(activity.timestamp)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
