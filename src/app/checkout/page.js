'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import Button from '@/components/ui/Button';
import { MapPin, CheckCircle, Loader2, LogIn, CreditCard, Building2, Copy, Truck, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import MercadoPagoBrick from '@/components/MercadoPagoBrick';
import AuthModal from '@/components/auth/AuthModal';
import { event } from '@/components/FacebookPixel';
import ShippingSelector from '@/components/checkout/ShippingSelector';

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, update: updateSession } = useSession();
    const { cart, cartTotal, cartSubtotal, cartSavings, clearCart } = useCart();
    const [preferenceId, setPreferenceId] = useState(null);
    const [loadingPreference, setLoadingPreference] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const mpAvailable = !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    const [selectedMethod, setSelectedMethod] = useState(mpAvailable ? 'mercadopago' : 'transfer'); // 'mercadopago' | 'transfer'
    const [showPaymentContent, setShowPaymentContent] = useState(false); // To control when to show the actual payment content (brick or details)
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [validatingDiscount, setValidatingDiscount] = useState(false);

    // Stock reservation and shipping
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [reservationIds, setReservationIds] = useState([]);
    const [stockError, setStockError] = useState(null);
    const [reservingStock, setReservingStock] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dni: '',
        phone: '',
        address: '',
        city: '',
    });

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('checkoutFormData');
        if (savedData) {
            setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
        }
    }, []);

    // Facebook Pixel: InitiateCheckout
    useEffect(() => {
        if (cart.length > 0) {
            event('InitiateCheckout', {
                content_ids: cart.map(item => item.id),
                content_type: 'product',
                value: cartTotal,
                currency: 'ARS',
                num_items: cart.length
            });
        }
    }, [cart.length, cartTotal]);

    // Validate stock availability on checkout load
    useEffect(() => {
        const validateStock = async () => {
            if (cart.length === 0) return;

            try {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    console.error('Failed to fetch products for stock validation');
                    return;
                }
                const products = await response.json();

                if (!Array.isArray(products)) {
                    console.error('Invalid products response:', products);
                    return;
                }

                const stockIssues = [];

                for (const cartItem of cart) {
                    const product = products.find(p => p.id === cartItem.id);
                    if (!product) continue;

                    const availableStock = (product.stock || 0) - (product.reservedStock || 0);

                    if (availableStock < cartItem.quantity) {
                        stockIssues.push({
                            name: product.name,
                            available: availableStock
                        });
                    }
                }

                if (stockIssues.length > 0) {
                    const message = 'Algunos productos no tienen stock suficiente:\n\n' +
                        stockIssues.map(i => `${i.name}: ${i.available} disponibles`).join('\n');

                    alert(message + '\n\nSerás redirigido al carrito.');
                    router.push('/shop');
                }
            } catch (error) {
                console.error('Error validating stock:', error);
            }
        };

        validateStock();
    }, [cart, router]);

    // Pre-fill from session if available
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || prev.name,
                email: session.user.email || prev.email,
                dni: session.user.dni || prev.dni,
                phone: session.user.phone || prev.phone,
                address: session.user.address || prev.address,
                city: session.user.city || prev.city,
            }));
        }
    }, [session]);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    }, [formData]);

    // Stock reservation functions
    const getCookieId = () => {
        let cookieId = localStorage.getItem('checkout_cookie_id');
        if (!cookieId) {
            cookieId = 'ck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('checkout_cookie_id', cookieId);
        }
        return cookieId;
    };

    // Stock reservation is now handled by the backend when creating the order
    // Keeping these functions commented for reference
    /*
    const reserveStock = async () => {
        setReservingStock(true);
        setStockError(null);
        try {
            const response = await fetch('/api/stock/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.id,
                        quantity: item.quantity
                    })),
                    sessionId: session?.user?.id || null,
                    cookieId: getCookieId()
                })
            });

            const data = await response.json();
            if (!data.success) {
                setStockError('Algunos productos no tienen stock suficiente');
            } else {
                setReservationIds(data.reservations.map(r => r.reservationId));
            }
        } catch (error) {
            console.error('Error reserving stock:', error);
            setStockError('Error al reservar stock. Por favor intentá nuevamente.');
        } finally {
            setReservingStock(false);
        }
    };

    const releaseStock = async () => {
        if (reservationIds.length === 0) return;

        try {
            await fetch('/api/stock/release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationIds })
            });
        } catch (error) {
            console.error('Error releasing stock:', error);
        }
    };
    */

    const [transferDiscount, setTransferDiscount] = useState(0);

    // Fetch transfer discount on mount
    useEffect(() => {
        fetch('/api/promotions/transfer')
            .then(res => res.json())
            .then(data => setTransferDiscount(data.discount || 0))
            .catch(err => console.error('Error fetching transfer discount:', err));
    }, []);

    // Calculate totals helper
    const calculateTotals = () => {
        let subtotal = cartSubtotal;
        let discountAmount = cartSavings;
        let total = cartTotal;

        // Apply coupon discount first
        if (appliedDiscount) {
            const couponDiscountFn = total * (appliedDiscount.percentage / 100);
            total -= couponDiscountFn;
        }

        // Apply transfer discount if selected
        let transferDiscountAmount = 0;
        if (selectedMethod === 'transfer' && transferDiscount > 0) {
            transferDiscountAmount = total * (transferDiscount / 100);
            total -= transferDiscountAmount;
        }

        // Add shipping
        if (selectedShipping) {
            total += selectedShipping.price;
        }

        return { subtotal, discountAmount, total, transferDiscountAmount };
    };

    const totals = calculateTotals();

    const createOrder = async (paymentId, status, method = 'mercadopago') => {
        try {
            const { total } = calculateTotals();

            const orderData = {
                customer: {
                    name: formData.name,
                    email: formData.email,
                    dni: formData.dni,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city
                },
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    options: item.selectedOptions
                })),
                total: total,
                shippingMethod: selectedShipping?.name || null,
                shippingCost: selectedShipping?.price || 0,
                mercadopagoPaymentId: method === 'mercadopago' ? paymentId : null,
                paymentMethod: method,
                paymentDetails: {
                    paymentId,
                    email: formData.email,
                    reservationIds: reservationIds
                },
                status: status,
                userId: session?.user?.id || null,
                discountCode: appliedDiscount ? appliedDiscount.code : null
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const newOrder = await response.json();

                // Decrement stock if payment approved immediately
                if (status === 'Pagado' && reservationIds.length > 0) {
                    try {
                        await fetch('/api/stock/decrement', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reservationIds })
                        });
                    } catch (error) {
                        console.error('Error decrementing stock:', error);
                    }
                }

                // Facebook Pixel: Purchase
                event('Purchase', {
                    content_ids: cart.map(item => item.id),
                    content_type: 'product',
                    value: orderData.total,
                    currency: 'ARS',
                    order_id: newOrder.id
                });

                clearCart();
                localStorage.removeItem('checkoutFormData');
                localStorage.removeItem('checkout_cookie_id');
                router.push(`/checkout/success?orderId=${newOrder.id}&method=${method}`);
            } else {
                throw new Error('Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
        }
    };

    const handlePaymentSuccess = async (paymentId, status, statusDetail) => {
        let orderStatus = 'Procesando';
        if (status === 'pending' || status === 'in_process') {
            orderStatus = 'Pendiente';
        } else if (status === 'approved') {
            orderStatus = 'Pagado';
        }
        await createOrder(paymentId, orderStatus, 'mercadopago');
    };

    const handleTransferSubmit = async () => {
        // Create order with 'Pendiente' status
        await createOrder('TRANSFER-' + Date.now(), 'Pendiente', 'transfer');
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setShowPaymentContent(false);
        setPreferenceId(null);
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;

        setValidatingDiscount(true);
        setDiscountError('');

        try {
            const res = await fetch('/api/discount/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: discountCode })
            });

            const data = await res.json();

            if (res.ok) {
                setAppliedDiscount(data);
                setDiscountError('');
            } else {
                setAppliedDiscount(null);
                setDiscountError(data.error || 'Código inválido');
            }
        } catch (error) {
            console.error('Error validating discount:', error);
            setDiscountError('Error al validar el código');
        } finally {
            setValidatingDiscount(false);
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setDiscountError('');
    };

    const handleContinue = async () => {
        if (!formData.name || !formData.email || !formData.dni || !formData.address || !formData.city) {
            alert('Por favor completa todos los datos de envío para continuar.');
            return;
        }

        if (!selectedShipping) {
            alert('Por favor seleccioná un método de envío.');
            return;
        }

        if (!session) {
            setIsAuthModalOpen(true);
            return;
        }

        // Stock reservation is now handled by backend when creating order
        setShowPaymentContent(true);

        if (selectedMethod === 'mercadopago') {
            await handleLoadBrick();
        }
    };

    const handleAuthSuccess = async () => {
        await updateSession();
        setIsAuthModalOpen(false);
    };

    const handleLoadBrick = async () => {
        setLoadingPreference(true);
        try {
            // Mercadopago total (without transfer discount)
            let total = appliedDiscount
                ? cartTotal * (1 - appliedDiscount.percentage / 100)
                : cartTotal;

            if (selectedShipping) {
                total += selectedShipping.price;
            }

            const response = await fetch('/api/mercadopago/preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    payer: {
                        email: formData.email,
                        name: formData.name,
                        dni: formData.dni,
                        address: {
                            street_name: formData.address,
                            city: formData.city
                        }
                    },
                    total
                }),
            });

            if (response.ok) {
                const { id } = await response.json();
                setPreferenceId(id);
            } else {
                console.error('Failed to create preference');
                alert('Error al iniciar el pago.');
            }
        } catch (error) {
            console.error('Error creating preference:', error);
            alert('Error de conexión.');
        } finally {
            setLoadingPreference(false);
        }
    };

    // ... (rest of initial renders)

    if (cart.length === 0) {
        return (
            <div className="pt-28 pb-20 px-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
                <Link href="/shop" passHref>
                    <Button>Ir a la tienda</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-in-out]">
            <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-8 text-center">Finalizar Compra</h1>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
                initialData={formData}
            />

            {!session && (
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <LogIn size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900">¿Ya tienes cuenta?</h3>
                            <p className="text-blue-700 text-sm">Inicia sesión para agilizar tu compra.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 border-transparent text-sm py-2"
                    >
                        Iniciar Sesión / Registrarse
                    </Button>
                </div>
            )}

            {stockError && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={24} />
                    <div>
                        <h3 className="font-bold text-red-900">Error de Stock</h3>
                        <p className="text-red-700 text-sm">{stockError}</p>
                    </div>
                </div>
            )}

            {reservingStock && (
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <p className="text-blue-700 text-sm">Reservando stock...</p>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="md:col-span-2 space-y-6">
                    {/* Shipping Info */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                        <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
                            <MapPin size={20} /> Datos de Envío
                        </h2>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Nombre Completo</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="Ej: Juan Pérez"
                                        value={formData.name}
                                        onChange={e => handleInputChange('name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="tu@email.com"
                                        value={formData.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">DNI</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="Número de documento"
                                        value={formData.dni}
                                        onChange={e => handleInputChange('dni', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                        placeholder="Cod. Área + Número"
                                        value={formData.phone}
                                        onChange={e => handleInputChange('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Dirección</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                    placeholder="Calle y altura"
                                    value={formData.address}
                                    onChange={e => handleInputChange('address', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Ciudad / Provincia</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] outline-none"
                                    placeholder="Ej: Resistencia, Chaco"
                                    value={formData.city}
                                    onChange={e => handleInputChange('city', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Method Selection */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                        <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
                            <Truck size={20} /> Método de Envío
                        </h2>
                        <ShippingSelector
                            selectedOption={selectedShipping}
                            onSelect={(option) => {
                                setSelectedShipping(option);
                                setShowPaymentContent(false); // Reset payment if shipping changes
                                setPreferenceId(null);
                            }}
                        />
                    </div>

                    {/* Payment Method Selection */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
                        <h2 className="font-bold text-xl mb-6">Método de Pago</h2>

                        <div className={`grid ${mpAvailable ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-6`}>
                            {mpAvailable && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedMethod('mercadopago');
                                        setShowPaymentContent(false);
                                        setPreferenceId(null);
                                    }}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedMethod === 'mercadopago'
                                        ? 'border-[#009EE3] bg-[#009EE3]/5 text-[#009EE3]'
                                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                                        }`}
                                >
                                    <CreditCard size={24} />
                                    <span className="font-medium text-sm">Mercado Pago</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedMethod('transfer');
                                    setShowPaymentContent(false);
                                }}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${selectedMethod === 'transfer'
                                    ? 'border-[#1a1a1a] bg-[#1a1a1a]/5 text-[#1a1a1a]'
                                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                                    }`}
                            >
                                {transferDiscount > 0 && (
                                    <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        -{transferDiscount}% OFF
                                    </span>
                                )}
                                <Building2 size={24} />
                                <span className="font-medium text-sm">Transferencia</span>
                            </button>
                        </div>

                        {!showPaymentContent ? (
                            <div className="text-center p-6 bg-stone-50 rounded-lg border border-stone-200">
                                <p className="text-stone-600 mb-4">
                                    Confirma tus datos para continuar con el pago.
                                </p>
                                <Button
                                    type="button"
                                    onClick={handleContinue}
                                    className="w-full md:w-auto flex items-center justify-center gap-2"
                                    disabled={loadingPreference}
                                >
                                    {loadingPreference ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Cargando...
                                        </>
                                    ) : (
                                        'Continuar'
                                    )}
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
                                        amount={totals.total}
                                        onPaymentSuccess={handlePaymentSuccess}
                                    />
                                )}

                                {selectedMethod === 'transfer' && (
                                    <div className="space-y-6">
                                        <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                                            <h3 className="font-bold text-lg mb-4">Datos Bancarios</h3>
                                            <div className="space-y-3 text-sm text-stone-700">
                                                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                                                    <span className="text-stone-500">Banco:</span>
                                                    <span className="font-medium">Banco Galicia</span>
                                                </div>
                                                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                                                    <span className="text-stone-500">Titular:</span>
                                                    <span className="font-medium">MATETE SHOP S.A.</span>
                                                </div>
                                                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                                                    <span className="text-stone-500">CBU:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">0070000000000000000000</span>
                                                        <button onClick={() => copyToClipboard('0070000000000000000000')} className="text-stone-400 hover:text-[#1a1a1a]">
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-stone-500">Alias:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">MATETE.SHOP.MP</span>
                                                        <button onClick={() => copyToClipboard('MATETE.SHOP.MP')} className="text-stone-400 hover:text-[#1a1a1a]">
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 text-xs text-stone-500 bg-yellow-50 p-3 rounded border border-yellow-100">
                                                <p>⚠️ Importante: El monto final a transferir es <strong>${totals.total.toLocaleString('es-AR')}</strong>. Envíanos el comprobante por WhatsApp.</p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleTransferSubmit}
                                            className="w-full bg-[#1a1a1a] hover:bg-stone-800"
                                        >
                                            Confirmar Transferencia
                                        </Button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPaymentContent(false);
                                        setPreferenceId(null);
                                    }}
                                    className="text-xs text-stone-500 underline mt-6 hover:text-stone-800 block mx-auto"
                                >
                                    Modificar datos de envío o método de pago
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-stone-50 p-8 rounded-xl h-fit border border-stone-200 sticky top-28">
                    <h2 className="font-bold text-xl mb-6">Resumen del Pedido</h2>
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                        {cart.map(item => (
                            <div key={item.cartId} className="flex justify-between text-sm">
                                <span className="text-stone-600">
                                    {item.quantity}x {item.name}
                                    {item.selectedOptions && Object.values(item.selectedOptions).length > 0 && (
                                        <span className="block text-xs text-stone-400 ml-4">
                                            {Object.values(item.selectedOptions).map(val => `+ ${val.name}`).join(', ')}
                                        </span>
                                    )}
                                </span>
                                <span className="font-medium">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-stone-200">
                        <div className="flex justify-between text-stone-600">
                            <span>Subtotal</span>
                            <span>${totals.subtotal.toLocaleString('es-AR')}</span>
                        </div>
                        {totals.discountAmount > 0 && (
                            <div className="flex justify-between text-[#8B5A2B] font-medium">
                                <span>Descuentos</span>
                                <span>-${totals.discountAmount.toLocaleString('es-AR')}</span>
                            </div>
                        )}
                        {appliedDiscount && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Descuento ({appliedDiscount.code})</span>
                                <span>-${(cartTotal * (appliedDiscount.percentage / 100)).toLocaleString('es-AR')}</span>
                            </div>
                        )}
                        {/* Transfer Discount Display */}
                        {selectedMethod === 'transfer' && totals.transferDiscountAmount > 0 && (
                            <div className="flex justify-between text-green-700 font-medium">
                                <span>Descuento Transferencia ({transferDiscount}%)</span>
                                <span>-${totals.transferDiscountAmount.toLocaleString('es-AR')}</span>
                            </div>
                        )}
                        {selectedShipping && (
                            <div className="flex justify-between text-stone-600">
                                <span>Envío ({selectedShipping.name})</span>
                                <span>{selectedShipping.price === 0 ? 'Gratis' : `$${selectedShipping.price.toLocaleString('es-AR')}`}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-[#1a1a1a] pt-2 border-t border-stone-200">
                            <span>Total</span>
                            <span>${totals.total.toLocaleString('es-AR')}</span>
                        </div>

                        {/* Discount Code Input */}
                        <div className="pt-4 mt-2 border-t border-stone-200">
                            {!appliedDiscount ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Código de descuento"
                                        className="flex-1 p-2 text-sm border border-stone-200 rounded-lg outline-none focus:border-stone-800 uppercase"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                    />
                                    <Button
                                        onClick={handleApplyDiscount}
                                        disabled={validatingDiscount || !discountCode.trim()}
                                        className="py-2 px-4 text-sm whitespace-nowrap"
                                    >
                                        {validatingDiscount ? <Loader2 className="animate-spin" size={16} /> : 'Aplicar'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-100">
                                    <span className="text-sm text-green-700 font-medium">
                                        {appliedDiscount.code} aplicado ({appliedDiscount.percentage}%)
                                    </span>
                                    <button
                                        onClick={handleRemoveDiscount}
                                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            )}
                            {discountError && (
                                <p className="text-red-500 text-xs mt-1">{discountError}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}