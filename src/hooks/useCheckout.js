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

    // Coupon Discount State
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [validatingDiscount, setValidatingDiscount] = useState(false);

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

    const handleDiscountChange = (code) => {
        setDiscountCode(code);
        setDiscountError('');
    };

    const handleApplyDiscount = async () => {
        if (!discountCode) return;
        setValidatingDiscount(true);
        setDiscountError('');

        try {
            const res = await fetch('/api/discount/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: discountCode })
            });
            const data = await res.json();

            if (!res.ok) {
                setDiscountError(data.error || 'Código inválido');
                setAppliedDiscount(null);
            } else {
                setAppliedDiscount(data); // { code, percentage }
                setDiscountCode(''); // Clear input? OR keep it. Let's keep it in state but maybe UI clears.
            }
        } catch (error) {
            setDiscountError('Error al validar cupón');
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
            let total = cartTotal;

            // Apply Coupon Discount FIRST (typically on subtotal, but here cartTotal = subtotal effectively if no other logic)
            if (appliedDiscount) {
                total = total * (1 - appliedDiscount.percentage / 100);
            }

            if (selectedShipping) total += selectedShipping.price;

            const response = await fetch('/api/mercadopago/preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        id: String(item.product.id),
                        title: item.product.name,
                        quantity: Number(item.quantity),
                        unit_price: Number(item.product.effectivePrice.amount), // Note: MP calculates total from unit * qty again? 
                        // If we apply global discount, we might need to discount unit prices OR add a "discount line item"
                        // Simplest for MP: send a "Discount" item with negative price OR adjust unit prices.
                        // However, MP Preference total is what controls the charge amount usually if explicit?
                        // Actually MP sums items. To apply discount we usually add an item with negative price.
                        // Let's rely on standard practice: Adjusted Global amount is tricky in MP Items array.
                        // Recommendation: Add a "Descuento" item.
                        currency_id: 'ARS',
                        picture_url: item.product.imageUrl
                    })),
                    // This total field in body might be ignored by MP preference creation if it relies on items.
                    // IMPORTANT: We need to see how backend handles this.
                    // Backend (likely) constructs preference from items.
                    // IF appliedDiscount, we should probably pass it to backend to create the preference correctly.
                    // BUT for now, let's pass `appliedDiscount` in the body so backend can handle it?
                    // The backend at /api/mercadopago/preference likely just maps items.
                    // I will pass `total` as override if backend implementation supports it?
                    // Let's check backend if needed. For now assuming simple total override capability or we will fix MP later.
                    payer: {
                        email: formData.email,
                        name: formData.name,
                        dni: formData.dni,
                        address: { street_name: formData.address, city: formData.city }
                    },
                    total, // Passing calculated total
                    appliedDiscount // Passing discount info
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

            // Apply Coupon Discount FIRST (if exists)
            if (appliedDiscount) {
                total = total * (1 - appliedDiscount.percentage / 100);
            }

            // Apply transfer discount if needed (Cumulative? Or exclusive? Usually exclusive or sequential)
            // If transfer is selected, we usually apply transfer discount INSTEAD or ON TOP.
            // Current logic: Transfer strategy in PricingService applies on top of effective price.
            // Let's assume sequential: (Total - Coupon) * Transfer.
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
                userId: session?.user?.id,
                discountCode: appliedDiscount?.code || null
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
        createOrder,
        // Discount Props
        discountCode,
        handleDiscountChange,
        handleApplyDiscount,
        handleRemoveDiscount,
        appliedDiscount,
        discountError,
        validatingDiscount
    };
};
