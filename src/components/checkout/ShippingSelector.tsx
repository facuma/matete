import React from 'react';
import { Truck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/atoms/Typography';
import { Money } from '@/domain/value-objects/Money';

// Mock shipping options for now - should come from Service/API
export const SHIPPING_OPTIONS = [
    { id: 'andreani', name: 'Envío a Domicilio (Andreani)', price: 6500, icon: Truck, description: 'Llega en 3-5 días hábiles' },
    { id: 'pickup', name: 'Retiro en Local', price: 0, icon: Store, description: 'Resistencia, Chaco' }
];

interface ShippingSelectorProps {
    selectedOption: any;
    onSelect: (option: any) => void;
}

export const ShippingSelector = ({ selectedOption, onSelect }: ShippingSelectorProps) => {
    return (
        <div className="space-y-3">
            {SHIPPING_OPTIONS.map((option) => (
                <div
                    key={option.id}
                    onClick={() => onSelect(option)}
                    className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                        selectedOption?.id === option.id
                            ? 'border-[#1a1a1a] bg-stone-50'
                            : 'border-stone-100 hover:border-stone-200'
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-full",
                            selectedOption?.id === option.id ? "bg-[#1a1a1a] text-white" : "bg-stone-100 text-stone-400 group-hover:bg-stone-200"
                        )}>
                            <option.icon size={20} />
                        </div>
                        <div>
                            <Typography variant="small" className="font-bold flex items-center gap-2">
                                {option.name}
                                {option.price === 0 && <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full">Gratis</span>}
                            </Typography>
                            <Typography variant="muted" className="text-xs">
                                {option.description}
                            </Typography>
                        </div>
                    </div>
                    <div className="text-right">
                        <Typography variant="small" className="font-bold block">
                            {option.price === 0 ? 'Gratis' : `$${option.price.toLocaleString('es-AR')}`}
                        </Typography>
                    </div>
                </div>
            ))}
        </div>
    );
};
