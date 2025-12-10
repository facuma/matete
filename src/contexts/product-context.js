'use client';

import { useStore } from './store-context';

// Adapter
export const useProducts = () => {
    const { products, loading, refreshData } = useStore();
    return {
        products,
        loading,
        refreshProducts: refreshData
    };
};

export const ProductProvider = ({ children }) => <>{children}</>;
