'use client';

import { useStore } from './store-context';

// Adapter to maintain API compatibility
export const useCategories = () => {
    const { categories, loading, refreshData } = useStore();
    return {
        categories,
        loading,
        refreshCategories: refreshData // Map refreshData to legacy name
    };
};

// Legacy Provider export to avoid breaking imports (though unused in layout now)
export const CategoryProvider = ({ children }) => <>{children}</>;
