'use client';

import React from 'react';
import Link from 'next/link';
import { LogIn, Loader2, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import Button from '@/components/ui/Button';
import AuthModal from '@/components/auth/AuthModal';
import MercadoPagoBrick from '@/components/MercadoPagoBrick';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { ShippingSelector } from '@/components/checkout/ShippingSelector';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { useCheckout } from '@/hooks/useCheckout';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/atoms/Typography';

export default function CheckoutPage() {
    const { cart } = useCart();
    const {
        formData,
        handleInputChange,
        selectedShipping,
        handleShippingSelect,
        selectedMethod,
        handleMethodSelect,
        transferDiscount,
        showPaymentContent,
        handleContinue,
        loadingPreference,
        preferenceId,
        isAuthModalOpen,
        setIsAuthModalOpen,
        session,
        updateSession,
        createOrder
    } = useCheckout();

    const mpAvailable = !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

    // Empty Cart State
    if (cart.length === 0) {
        return (
            <div className="pt-28 pb-20 px-6 text-center">
                <Typography variant="h2" className="mb-4">Tu carrito está vacío</Typography>
                <Link href="/shop" passHref>
                    <Button>Ir a la tienda</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-in-out]">
            <Typography variant="h2" className="text-center mb-8 font-serif">Finalizar Compra</Typography>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => { updateSession(); setIsAuthModalOpen(false); }}
                initialData={formData}
            />

            {/* Login Prompt for Guests */}
            {!session && (
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <LogIn size={20} />
                        </div>
                        <div>
                            <Typography variant="h4" className="text-blue-900 mb-0">¿Ya tienes cuenta?</Typography>
                            <Typography variant="small" className="text-blue-700">Inicia sesión para agilizar tu compra.</Typography>
                        </div>
                    </div>
                    <Button onClick={() => setIsAuthModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 border-transparent">
                        Iniciar Sesión / Registrarse
                    </Button>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Steps */}
                <div className="md:col-span-2 space-y-6">

                    {/* 1. SHIPPING DATA */}
                    <CheckoutForm formData={formData} onChange={handleInputChange} />

                    {/* 2. SHIPPING METHOD */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                        <Typography variant="h4" className="mb-6">Método de Envío</Typography>
                        <ShippingSelector selectedOption={selectedShipping} onSelect={handleShippingSelect} />
                    </div>

                    {/* 3. PAYMENT METHOD */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                        <Typography variant="h4" className="mb-6">Método de Pago</Typography>

                        <PaymentMethodSelector
                            selectedMethod={selectedMethod}
                            onSelect={handleMethodSelect}
                            transferDiscount={transferDiscount}
                            mpAvailable={mpAvailable}
                        />

                        {/* Payment Confirmation Area */}
                        {!showPaymentContent ? (
                            <div className="text-center p-6 bg-stone-50 rounded-lg border border-stone-200">
                                <Typography variant="muted" className="mb-4">Confirma tus datos para continuar con el pago.</Typography>
                                <Button
                                    type="button"
                                    onClick={handleContinue}
                                    className="w-full md:w-auto flex items-center justify-center gap-2"
                                    disabled={loadingPreference}
                                >
                                    {loadingPreference ? <><Loader2 className="animate-spin" size={20} /> Cargando...</> : 'Continuar'}
                                </Button>
                            </div>
                        ) : (
                            <div className="animate-[fadeIn_0.5s_ease-in-out]">
                                <div className="flex items-center gap-2 text-green-600 mb-6 bg-green-50 p-3 rounded-lg">
                                    <CheckCircle size={20} />
                                    <span className="text-sm font-medium">Datos confirmados.</span>
                                </div>

                                {selectedMethod === 'mercadopago' && preferenceId && (
                                    <MercadoPagoBrick
                                        preferenceId={preferenceId}
                                        amount={100} // This should properly flow from hooks/context
                                        onPaymentSuccess={(pid, status) => createOrder(pid, status === 'approved' ? 'Pagado' : 'Pendiente', 'mercadopago')}
                                    />
                                )}

                                {selectedMethod === 'transfer' && (
                                    <div className="space-y-6">
                                        <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                                            <Typography variant="h4" className="mb-4">Datos Bancarios</Typography>
                                            <Typography variant="small" className="block mb-2">Banco: Galicia</Typography>
                                            <Typography variant="small" className="block mb-2">CBU: 0070000000000000000000</Typography>
                                            <Typography variant="small" className="block">Alias: MATETE.SHOP.MP</Typography>
                                        </div>
                                        <Button onClick={() => createOrder('TRANSFER-' + Date.now(), 'Pendiente', 'transfer')} className="w-full">
                                            Confirmar Transferencia
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Summary */}
                <div>
                    <OrderSummary
                        shippingPrice={selectedShipping?.price || 0}
                        paymentMethod={selectedMethod}
                    />
                </div>
            </div>
        </div>
    );
}