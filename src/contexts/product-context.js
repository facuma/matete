'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useStore } from './store-context';
import { ApiProductRepository } from '@/infrastructure/repositories/ApiProductRepository';
import { CachedProductRepository } from '@/infrastructure/repositories/CachedProductRepository';

const ProductContext = createContext();

export function ProductProvider({ children }) {
    const { products: initialProducts, loading: storeLoading } = useStore(); // Initial "Featured" products from Store
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });

    // Repository Instance (Stable)
    const repository = useRef(null);

    if (!repository.current) {
        const apiRepo = new ApiProductRepository();
        repository.current = new CachedProductRepository(apiRepo);
    }

    // Initialize with Store data if available (Fast Paint)
    useEffect(() => {
        if (initialProducts && initialProducts.length > 0 && products.length === 0) {
            setProducts(initialProducts);
            setLoading(false);
        }
    }, [initialProducts]);

    /**
     * Fetch products using Repository
     */
    const fetchProducts = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            // Merge pagination defaults
            const currentParams = {
                page: 1,
                limit: 12,
                ...params
            };

            // If category is 'todos', remove it to fetch all
            if (currentParams.category === 'todos') delete currentParams.category;

            const res = await repository.current.getAll(currentParams);

            // If we are just Paginating (page > 1), might want to Append
            // If we are Filtering, Repalce.
            // For now, let's Replace to be safe and simple for the Grid.
            // EXCEPT if explicit "append" flag (not in interface yet) or logic in UI.
            // The UI usually handles pagination by replacing grid or infinite scroll.
            // Let's assume Replacement for standard pagination.

            setProducts(res);

            // Mock pagination info update if Repository provided it (it returns array now)
            // Ideally Repo should return { items, meta }. 
            // For now, we assume Repo returns generic array.

        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const getProduct = useCallback(async (slug) => {
        return await repository.current.getBySlug(slug);
    }, []);

    const searchProducts = useCallback(async (query) => {
        return await repository.current.search(query);
    }, []);

    return (
        <ProductContext.Provider value={{
            products,
            loading: loading || storeLoading, // Initial load might depend on store
            fetchProducts,
            getProduct,
            searchProducts,
            repository: repository.current
        }}>
            {children}
        </ProductContext.Provider>
    );
}

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProducts must be used within ProductProvider');
    return context;
};
