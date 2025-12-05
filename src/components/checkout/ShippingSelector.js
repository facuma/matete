'use client';

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, Check } from 'lucide-react';

export default function ShippingSelector({ onSelect, selectedOption }) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShippingOptions();
    }, []);

    const fetchShippingOptions = async () => {
        try {
            const response = await fetch('/api/shipping/options');
            if (response.ok) {
                const data = await response.json();
                setOptions(data);
                // Auto-select first option if none selected
                if (!selectedOption && data.length > 0) {
                    onSelect(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching shipping options:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-3">
                <div className="h-24 bg-stone-200 rounded-lg"></div>
                <div className="h-24 bg-stone-200 rounded-lg"></div>
                <div className="h-24 bg-stone-200 rounded-lg"></div>
            </div>
        );
    }

    if (options.length === 0) {
        return (
            <div className="text-center text-stone-500 py-8">
                No hay opciones de envío disponibles en este momento.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {options.map((option) => {
                const isSelected = selectedOption?.id === option.id;

                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelect(option)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                            ? 'border-[#8B5A2B] bg-[#8B5A2B]/5'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#8B5A2B] text-white' : 'bg-stone-100 text-stone-600'
                                    }`}>
                                    {option.price === 0 ? (
                                        <MapPin size={20} />
                                    ) : (
                                        <Truck size={20} />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`font-semibold ${isSelected ? 'text-[#8B5A2B]' : 'text-stone-900'
                                            }`}>
                                            {option.name}
                                        </h4>
                                        <span className={`font-bold text-lg ${isSelected ? 'text-[#8B5A2B]' : 'text-stone-900'
                                            }`}>
                                            {option.price === 0 ? 'Gratis' : `$${option.price.toLocaleString('es-AR')}`}
                                        </span>
                                    </div>

                                    {option.description && (
                                        <p className="text-sm text-stone-600 mb-2">
                                            {option.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-1 text-xs text-stone-500">
                                        <Clock size={14} />
                                        <span>{option.deliveryDays}</span>
                                    </div>
                                </div>
                            </div>

                            {isSelected && (
                                <div className="ml-3 text-[#8B5A2B]">
                                    <Check size={24} />
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
