import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- HELPER PARA IMÁGENES DE PRODUCTOS ---

export const getProductImage = (product) => {
    if (product.imageUrl) return product.imageUrl;
    // Fallback a placeholder estático si no hay imagen
    return '/placeholder-mate.jpg';
};

export const formatPrice = (value) => new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
}).format(value);