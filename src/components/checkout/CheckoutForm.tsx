import React from 'react';
import { MapPin } from 'lucide-react';
import { FormField } from '@/components/molecules/FormField';
import { Typography } from '@/components/atoms/Typography';

interface CheckoutFormProps {
    formData: any;
    onChange: (field: string, value: string) => void;
}

export const CheckoutForm = ({ formData, onChange }: CheckoutFormProps) => {
    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
                <MapPin size={20} /> Datos de Envío
            </h2>
            <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        label="Nombre Completo"
                        placeholder="Ej: Juan Pérez"
                        value={formData.name}
                        onChange={e => onChange('name', e.target.value)}
                        required
                    />
                    <FormField
                        label="Email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={e => onChange('email', e.target.value)}
                        required
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        label="DNI"
                        placeholder="Número de documento"
                        value={formData.dni}
                        onChange={e => onChange('dni', e.target.value)}
                        required
                    />
                    <FormField
                        label="Teléfono"
                        type="tel"
                        placeholder="Cod. Área + Número"
                        value={formData.phone}
                        onChange={e => onChange('phone', e.target.value)}
                    />
                </div>
                <FormField
                    label="Dirección"
                    placeholder="Calle y altura"
                    value={formData.address}
                    onChange={e => onChange('address', e.target.value)}
                    required
                />
                <FormField
                    label="Ciudad / Provincia"
                    placeholder="Ej: Resistencia, Chaco"
                    value={formData.city}
                    onChange={e => onChange('city', e.target.value)}
                    required
                />
            </div>
        </div>
    );
};
