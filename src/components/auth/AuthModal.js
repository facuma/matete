'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { Mail, Lock, User, Phone, MapPin, FileText, X, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess, initialData = {} }) {
    const [isLogin, setIsLogin] = useState(true);
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dni: '',
        phone: '',
        address: '',
        city: ''
    });

    // Reset state when closing/opening
    useEffect(() => {
        if (!isOpen) {
            setVerificationStep(false);
            setVerificationCode('');
            setError('');
        }
        if (isOpen && initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                password: '' // Don't pre-fill password
            }));
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verificationEmail, code: verificationCode })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al verificar');
                setLoading(false);
                return;
            }

            // Auto login after verification
            const result = await signIn('credentials', {
                email: verificationEmail,
                password: formData.password,
                redirect: false
            });

            if (result?.ok) {
                onSuccess();
                onClose();
            } else {
                setError('Verificación exitosa, pero error al iniciar sesión.');
                setLoading(false);
            }

        } catch (err) {
            console.error('Verification error:', err);
            setError('Error al procesar la verificación');
            setLoading(false);
        }
    };

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
                } else {
                    onSuccess();
                    onClose();
                }
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

                if (data.requireVerification) {
                    setVerificationEmail(formData.email);
                    setVerificationStep(true);
                    setLoading(false);
                    setError(''); // Clear any previous errors
                    return;
                }

                // Fallback for old flow (should not happen now)
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                });

                if (result?.ok) {
                    onSuccess();
                    onClose();
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError('Error al procesar la solicitud');
            setLoading(false);
        }
    };

    if (verificationStep) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-in-out]">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                    >
                        <X size={24} />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">
                                Verifica tu Email
                            </h2>
                            <p className="text-stone-600 text-sm">
                                Hemos enviado un código de 6 dígitos a <strong>{verificationEmail}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleVerificationSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Código de Verificación</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none tracking-widest text-center text-xl"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full bg-[#1a1a1a] hover:bg-stone-800 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                Verificar y Comenzar
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-in-out]">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">
                            {isLogin ? 'Bienvenido de nuevo' : 'Crear Cuenta'}
                        </h2>
                        <p className="text-stone-600 text-sm">
                            {isLogin
                                ? 'Inicia sesión para continuar con tu compra'
                                : 'Regístrate para guardar tu pedido en tu historial'}
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
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">DNI</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={formData.dni}
                                                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                                placeholder="DNI"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                                placeholder="Teléfono"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Dirección</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                            placeholder="Calle y altura"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Ciudad</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                            placeholder="Ciudad / Provincia"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
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
                            className="w-full bg-[#1a1a1a] hover:bg-stone-800 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center pt-4 border-t border-stone-100">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm text-stone-600 hover:text-[#1a1a1a] font-medium"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
