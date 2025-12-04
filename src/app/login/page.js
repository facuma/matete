'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Mail, Lock, User, Phone, MapPin, FileText } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('view') !== 'register');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dni: '',
        phone: '',
        address: '',
        city: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-fill from URL params
    useEffect(() => {
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const dni = searchParams.get('dni');
        const address = searchParams.get('address');
        const city = searchParams.get('city');

        if (name || email || dni || address || city) {
            setFormData(prev => ({
                ...prev,
                name: name || prev.name,
                email: email || prev.email,
                dni: dni || prev.dni,
                address: address || prev.address,
                city: city || prev.city
            }));
            // If data is passed, likely coming from checkout, so switch to register
            if (searchParams.get('view') === 'register') {
                setIsLogin(false);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                });

                if (result?.error) {
                    setError('Credenciales inválidas');
                    setLoading(false);
                    return;
                }

                // Redirect to callback URL or my-orders
                const callbackUrl = searchParams.get('callbackUrl') || '/my-orders';
                router.push(callbackUrl);
                router.refresh();
            } else {
                // Register
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || 'Error al crear cuenta');
                    setLoading(false);
                    return;
                }

                // Auto login after registration
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                });

                if (result?.ok) {
                    const callbackUrl = searchParams.get('callbackUrl') || '/my-orders';
                    router.push(callbackUrl);
                    router.refresh();
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError('Error al procesar la solicitud');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 pt-20 pb-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-2">
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h1>
                    <p className="text-stone-600">
                        {isLogin ? 'Accede a tu historial de pedidos' : 'Regístrate para ver tus pedidos'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">DNI</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.dni}
                                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="Número de documento"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="Cod. Área + Número"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Dirección</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="Calle y altura"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Ciudad</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="Ciudad / Provincia"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a] outline-none"
                                placeholder="••••••••"
                                minLength={8}
                            />
                        </div>
                        {!isLogin && (
                            <p className="text-xs text-stone-500 mt-1">Mínimo 8 caracteres</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1a1a1a] hover:bg-stone-800"
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-sm text-stone-600 hover:text-[#1a1a1a]"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-stone-500 hover:text-stone-700">
                        ← Volver a la tienda
                    </Link>
                </div>
            </div>
        </div>
    );
}
