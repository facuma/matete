'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
    const [data, setData] = useState({
        categories: [],
        products: [],
        content: null
    });
    const [loading, setLoading] = useState(true);

    const refreshData = async (retries = 3, delay = 1000) => {
        try {
            const res = await fetch('/api/init');

            if (!res.ok) {
                if (retries > 0) {
                    console.warn(`Init fetch failed, retrying... (${retries} attempts left)`);
                    setTimeout(() => refreshData(retries - 1, delay * 2), delay);
                    return;
                }
                throw new Error('Failed to fetch initial data');
            }

            const payload = await res.json();

            setData(payload);

            if (typeof window !== 'undefined') {
                localStorage.setItem('matete_store', JSON.stringify({
                    data: payload,
                    timestamp: Date.now()
                }));
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to init store:", error);
            if (retries === 0) setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        // 1. Try Cache
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('matete_store');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setData(parsed.data);
                    setLoading(false);
                } catch (e) {
                    console.error('Error parsing store cache:', e);
                }
            }
        }

        // 2. Fetch Fresh (Single Request)
        refreshData();
    }, []);


    return (
        <StoreContext.Provider value={{ ...data, loading, refreshData }}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within StoreProvider');
    return context;
};
