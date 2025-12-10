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