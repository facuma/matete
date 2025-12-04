// --- HELPER PARA IMÁGENES DE PRODUCTOS ---

export const getProductImage = (product) => {
    if (product.imageUrl) return product.imageUrl;
    // Fallback a placeholder estático si no hay imagen
    return '/placeholder-mate.jpg';
};