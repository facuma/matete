'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, MessageCircle, Copy } from 'lucide-react';
import Button from '../../../components/ui/Button';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const method = searchParams.get('method');

    const whatsappNumber = "5491112345678"; // Replace with real number
    const whatsappMessage = `Hola! Hice una compra en Matete. Mi orden es #${orderId}. Envío el comprobante de transferencia.`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6] px-4 text-center animate-[fadeIn_0.5s_ease-in-out]">
            <div className="bg-green-100 p-6 rounded-full text-green-800 mb-6">
                <ShoppingBag size={48} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-2">¡Gracias por tu compra!</h1>

            {orderId && (
                <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 mb-4 shadow-sm">
                    <p className="text-stone-500 text-sm uppercase tracking-wider font-medium">Orden N°</p>
                    <p className="text-2xl font-bold text-[#1a1a1a]">{orderId}</p>
                </div>
            )}

            <p className="text-xl text-stone-600 mb-8 max-w-lg">
                Tu pedido ha sido registrado exitosamente.
            </p>

            {method === 'transfer' && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm max-w-md w-full mb-8 text-left">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-[#1a1a1a]">
                        <MessageCircle className="text-green-600" />
                        Confirmar Pago
                    </h3>
                    <p className="text-stone-600 mb-4 text-sm">
                        Para finalizar el proceso, por favor envíanos el comprobante de transferencia por WhatsApp indicando tu número de orden.
                    </p>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        <MessageCircle size={20} />
                        Enviar Comprobante
                    </a>
                </div>
            )}

            <Link href="/" passHref><Button>Volver al Inicio</Button></Link>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}