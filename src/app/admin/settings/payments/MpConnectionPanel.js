'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MpConnectionPanel({ initialStatus, mpUserId, mpExpiresAt }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('connected')) {
            setStatus('connected');
            router.refresh();
        }
    }, [searchParams, router]);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/mercadopago', { method: 'POST' });
            if (!res.ok) throw new Error('Error init auth');
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error(err);
            alert('Error al iniciar conexión');
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('¿Estás seguro de desconectar la cuenta? Se dejarán de procesar pagos.')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/auth/mercadopago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'disconnect' })
            });
            if (res.ok) {
                setStatus('disconnected');
                router.refresh();
            } else {
                alert('Error al desconectar');
            }
        } catch (err) {
            console.error(err);
            alert('Error de red');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <p className="text-gray-600 mb-6">
                Conecta tu cuenta de Mercado Pago para recibir los pagos de tus ventas directamente.
            </p>

            {status === 'connected' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {/* Check circle icon */}
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Conectado exitosamente</h3>
                            <div className="mt-2 text-sm text-green-700">
                                <p>Tu cuenta de Mercado Pago está vinculada y lista para procesar pagos.</p>
                                {mpUserId && <p className="mt-1">ID de Usuario MP: {mpUserId}</p>}
                                {mpExpiresAt && <p className="mt-1 text-xs text-green-600">Expira: {new Date(mpExpiresAt).toLocaleDateString()}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {status === 'expired' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {/* Exclamation icon */}
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Conexión Expirada</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Tus credenciales han expirado. Por favor, reconecta tu cuenta.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${status === 'connected' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                    {loading ? 'Procesando...' : (status === 'connected' ? 'Reconectar Cuenta' : 'Conectar con Mercado Pago')}
                </button>

                {(status === 'connected' || status === 'expired') && (
                    <button
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Desconectar
                    </button>
                )}
            </div>
        </div>
    );
}
