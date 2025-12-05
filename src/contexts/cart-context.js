'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { event } from '@/components/FacebookPixel';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on initial render
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('matete_cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('matete_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = async (product, qty = 1, options = {}) => {
        // Validate stock availability before adding (silently - UI will show disabled state)
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            const currentProduct = products.find(p => p.id === product.id);

            if (!currentProduct) return false;

            const availableStock = (currentProduct.stock || 0) - (currentProduct.reservedStock || 0);

            const optionsString = JSON.stringify(Object.keys(options).sort().reduce((obj, key) => {
                obj[key] = options[key];
                return obj;
            }, {}));
            const cartId = `${product.id}-${optionsString}`;
            const existingItem = cart.find(item => item.cartId === cartId);
            const currentCartQuantity = existingItem ? existingItem.quantity : 0;
            const totalQuantity = currentCartQuantity + qty;

            // Silently prevent if exceeds stock
            if (totalQuantity > availableStock) {
                return false;
            }
        } catch (error) {
            console.error('Error validating stock:', error);
        }

        // Facebook Pixel Event: AddToCart
        event('AddToCart', {
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            value: product.promotionalPrice || product.price,
            currency: 'ARS'
        });

        setCart(prev => {
            const optionsString = JSON.stringify(Object.keys(options).sort().reduce((obj, key) => {
                obj[key] = options[key];
                return obj;
            }, {}));
            const cartId = `${product.id}-${optionsString}`;

            const exists = prev.find(item => item.cartId === cartId);

            if (exists) {
                return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + qty } : item);
            }

            return [...prev, { ...product, quantity: qty, selectedOptions: options, cartId }];
        });
        setIsCartOpen(true);
        return true;
    };

    const removeFromCart = (cartId) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartSavings = cart.reduce((acc, item) => {
        const regularPrice = item.regularPrice || item.price;
        return acc + ((regularPrice - item.price) * item.quantity);
    }, 0);
    const cartSubtotal = cartTotal + cartSavings;
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const value = { cart, isCartOpen, setIsCartOpen, addToCart, removeFromCart, clearCart, cartTotal, cartCount, cartSavings, cartSubtotal };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};