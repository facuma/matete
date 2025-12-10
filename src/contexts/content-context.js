'use client';

import { useStore } from './store-context';

// Adapter
export const useContent = () => {
    const { content, loading, refreshData } = useStore();
    return {
        content,
        loading,
        refreshContent: refreshData // Map if needed
    };
};

export const ContentProvider = ({ children }) => <>{children}</>;
