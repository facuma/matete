import React from 'react';
import { CreditCard, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/atoms/Badge';

interface PaymentMethodSelectorProps {
    selectedMethod: 'mercadopago' | 'transfer';
    onSelect: (method: 'mercadopago' | 'transfer') => void;
    transferDiscount?: number;
    mpAvailable?: boolean;
}

export const PaymentMethodSelector = ({
    selectedMethod,
    onSelect,
    transferDiscount = 0,
    mpAvailable = true
}: PaymentMethodSelectorProps) => {
    return (
        <div className={`grid ${mpAvailable ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-6`}>
            {mpAvailable && (
                <button
                    type="button"
                    onClick={() => onSelect('mercadopago')}
                    className={cn(
                        "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                        selectedMethod === 'mercadopago'
                            ? 'border-[#009EE3] bg-[#009EE3]/5 text-[#009EE3]'
                            : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    )}
                >
                    <CreditCard size={24} />
                    <span className="font-medium text-sm">Mercado Pago</span>
                </button>
            )}
            <button
                type="button"
                onClick={() => onSelect('transfer')}
                className={cn(
                    "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden",
                    selectedMethod === 'transfer'
                        ? 'border-[#1a1a1a] bg-[#1a1a1a]/5 text-[#1a1a1a]'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                )}
            >
                {transferDiscount > 0 && (
                    <div className="absolute top-2 right-2">
                        <Badge variant="success" className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 border-0">
                            -{transferDiscount}% OFF
                        </Badge>
                    </div>
                )}
                <Building2 size={24} />
                <span className="font-medium text-sm">Transferencia</span>
            </button>
        </div>
    );
};
