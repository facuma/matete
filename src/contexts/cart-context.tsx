'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceFactory } from '@/infrastructure/factories/ServiceFactory';
import { CartItem } from '@/domain/entities/CartItem';
import { Product } from '@/domain/entities/Product';
import { Money } from '@/domain/value-objects/Money';
import { event } from '@/components/FacebookPixel';
import { Toaster, toast } from 'sonner';

// Initialize Service
const cartService = ServiceFactory.getCartService();

interface CartContextType {
    cart: CartItem[];
    cartTotal: number;
    cartSubtotal: number;
    cartSavings: number;
    cartCount: number;
    addItem: (product: any, quantity?: number, options?: any) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [totals, setTotals] = useState({ subtotal: 0, total: 0, count: 0 });
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Sync React State with Service
    const refreshState = () => {
        setItems([...cartService.getItems()]);
        const calculated = cartService.getTotals();
        setTotals({
            subtotal: calculated.subtotal.amount,
            total: calculated.total.amount, // Effective total after strategies
            count: calculated.count
        });
    };

    // Load from LocalStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // We need to rehydrate logic potentially? 
                // For now assuming simplistic structure match or we'll assume empty if schema changed too much
                // Ideally we map parsed JSON back to CartItem/Product instances
                // But simplified:
                // cartService.setItems(parsed.map(...) ) 

                // Let's rely on component interaction to fill service for now or naive load:
                // Note: CartItem constructor generates ID. If we load, we should keep IDs.
                // We strongly suggest treating LS data as 'DTOs' and re-adding via domain logic if complex
                // OR simplistically casting for this migration step:

                // Rehydration Logic (Simplified)
                const rehydratedItems = parsed.map((p: any) => {
                    // Reconstruct Product with proper Money Value Objects
                    // Handle legacy data where price might be a number
                    const rawPrice = p.product.price;
                    const priceAmount = typeof rawPrice === 'object' && rawPrice.amount
                        ? rawPrice.amount
                        : (typeof rawPrice === 'number' ? rawPrice : 0);

                    const price = new Money(priceAmount, 'ARS');

                    const rawPromo = p.product.promotionalPrice;
                    const promoAmount = typeof rawPromo === 'object' && rawPromo.amount
                        ? rawPromo.amount
                        : (typeof rawPromo === 'number' ? rawPromo : undefined);

                    const promotionalPrice = promoAmount !== undefined
                        ? new Money(promoAmount, 'ARS')
                        : undefined;

                    const productEnt = new Product({
                        ...p.product,
                        price,
                        promotionalPrice
                    });

                    const item = new CartItem(productEnt, p.quantity, p.selectedOptions);
                    item.id = p.id || item.id;
                    return item;
                });

                cartService.setItems(rehydratedItems);
                refreshState();
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        }
    }, []);

    // Persist to LocalStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (productData: any, quantity: number = 1, options: any = {}) => {
        // Adapt raw product data to Domain if needed (ProductDetail component passes what?)
        // If it passes a full object, we ensure it's a domain entity
        const product = productData instanceof Product ? productData : new Product(productData);

        cartService.addItem(product, quantity, options);
        refreshState();
        setIsCartOpen(true);
        toast.success('Producto agregado al carrito');

        // Pixel Event
        event('AddToCart', {
            content_ids: [product.id],
            content_name: product.name,
            currency: 'ARS',
            value: product.price.amount
        });
    };

    const removeItem = (id: string) => {
        cartService.removeItem(id);
        refreshState();
    };

    const updateQuantity = (id: string, qty: number) => {
        cartService.updateQuantity(id, qty);
        refreshState();
    };

    const clearCart = () => {
        cartService.clear();
        refreshState();
    };

    const cartSavings = totals.subtotal - totals.total;

    return (
        <CartContext.Provider value={{
            cart: items,
            cartTotal: totals.total,
            cartSubtotal: totals.subtotal,
            cartSavings,
            cartCount: totals.count,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
