import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { useSession } from 'next-auth/react';
import { useServices } from '@/contexts/services/service-context';
// Note: In a pure clean architecture, this hook would call an Application Service (CheckoutService) 
// which would then call Repositories/APIs. For now, it orchestrates the existing API calls.

export const useCheckout = () => {
    const router = useRouter();
    const { data: session, update: updateSession } = useSession();
    const { cart, cartTotal, clearCart } = useCart();
    const { pricingService } = useServices();

    // State
    const [formData, setFormData] = useState({
        name: '', email: '', dni: '', phone: '', address: '', city: ''
    });
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('mercadopago'); // 'mercadopago' | 'transfer'
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [loadingPreference, setLoadingPreference] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);
    const [showPaymentContent, setShowPaymentContent] = useState(false);

    // Transfer Discount State
    const [transferDiscount, setTransferDiscount] = useState(0);

    // Load Data
    useEffect(() => {
        const savedData = localStorage.getItem('checkoutFormData');
        if (savedData) setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));

        // Fetch transfer discount
        fetch('/api/promotions/transfer')
            .then(res => res.json())
            .then(data => setTransferDiscount(data.discount || 0))
            .catch(err => console.error(err));
    }, []);

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

    useEffect(() => {
        localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    }, [formData]);

    // Handlers
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setShowPaymentContent(false);
        setPreferenceId(null);
    };

    const handleShippingSelect = (option) => {
        setSelectedShipping(option);
        setShowPaymentContent(false);
        setPreferenceId(null);
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setShowPaymentContent(false);
        setPreferenceId(null);
    };

    const handleContinue = async () => {
        if (!formData.name || !formData.email || !formData.dni || !formData.address || !formData.city) {
            alert('Por favor completa todos los datos de envío.');
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

        setShowPaymentContent(true);

        if (selectedMethod === 'mercadopago') {
            await loadMercadoPagoPreference();
        }
    };

    const loadMercadoPagoPreference = async () => {
        setLoadingPreference(true);
        try {
            // Logic to calculate total for MP preference
            // We should ideally reuse the PricingService here or get total from context
            // For now, retaining similar logic to ensure consistency with backend expectation
            let total = cartTotal; // Need to verify if this matches OrderSummary logic
            if (selectedShipping) total += selectedShipping.price;

            const response = await fetch('/api/mercadopago/preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        id: String(item.product.id),
                        title: item.product.name,
                        quantity: Number(item.quantity),
                        unit_price: Number(item.product.effectivePrice.amount),
                        currency_id: 'ARS',
                        picture_url: item.product.imageUrl
                    })),
                    payer: {
                        email: formData.email,
                        name: formData.name,
                        dni: formData.dni,
                        address: { street_name: formData.address, city: formData.city }
                    },
                    total
                }),
            });

            if (response.ok) {
                const { id } = await response.json();
                setPreferenceId(id);
            } else {
                alert('Error al iniciar el pago.');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión.');
        } finally {
            setLoadingPreference(false);
        }
    };

    const createOrder = async (paymentId, status, method = 'mercadopago') => {
        // ... (Order creation logic similar to previous implementation)
        // Ideally this moves to an API service class
        try {
            let total = cartTotal;
            // Apply transfer discount if needed
            if (method === 'transfer' && transferDiscount > 0) {
                total = total * (1 - transferDiscount / 100);
            }
            if (selectedShipping) total += selectedShipping.price;

            const orderData = {
                customer: formData,
                items: cart.map(item => ({
                    id: item.product.id, // Product ID
                    name: item.product.name,
                    price: item.product.effectivePrice.amount, // Use effective price
                    quantity: item.quantity,
                    options: item.selectedOptions
                })),
                total,
                shippingMethod: selectedShipping?.name,
                shippingCost: selectedShipping?.price,
                paymentMethod: method,
                paymentDetails: { paymentId },
                status,
                userId: session?.user?.id
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const newOrder = await response.json();
                clearCart();
                localStorage.removeItem('checkoutFormData');
                router.push(`/checkout/success?orderId=${newOrder.id}&method=${method}`);
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error al crear la orden');
        }
    };

    return {
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
    };
};
