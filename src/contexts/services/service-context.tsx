'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ServiceFactory } from '@/infrastructure/factories/ServiceFactory';
import { PricingService } from '@/application/services/PricingService';

interface ServiceContextType {
    pricingService: PricingService;
}

const ServiceContext = createContext<ServiceContextType | null>(null);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
    // We instantiate services using the factory
    // In a real SSR scenario we might need to handle this differently, but for client components this works
    const pricingService = ServiceFactory.getPricingService();

    return (
        <ServiceContext.Provider value={{ pricingService }}>
            {children}
        </ServiceContext.Provider>
    );
};

export const useServices = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};
