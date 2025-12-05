/**
 * Shipping options helper functions
 */

/**
 * Get available shipping options
 * @returns {Promise<Array>} Array of enabled shipping options
 */
export async function getAvailableOptions() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/shipping/options`);
        if (!response.ok) {
            throw new Error('Failed to fetch shipping options');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching shipping options:', error);
        return [];
    }
}

/**
 * Calculate shipping cost based on city and items (simulated)
 * For now, this is a simple simulation. In future, integrate with real shipping API.
 * @param {string} city - Destination city
 * @param {Array} items - Cart items
 * @param {number} optionPrice - Base price from selected shipping option
 * @returns {number} Calculated shipping cost
 */
export function calculateShipping(city, items, optionPrice) {
    // Base price from shipping option
    let cost = optionPrice;

    // Simulate city-based adjustment (example logic)
    const mainCities = ['Buenos Aires', 'Córdoba', 'Rosario', 'Resistencia', 'Mendoza'];
    const cityLower = city.toLowerCase();
    const isMainCity = mainCities.some(c => cityLower.includes(c.toLowerCase()));

    // If not a main city and not pickup (price > 0), add regional surcharge
    if (!isMainCity && cost > 0) {
        cost = cost * 1.2; // 20% surcharge for remote areas
    }

    // Simulate weight-based calculation
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 5 && cost > 0) {
        cost += (totalItems - 5) * 200; // Extra $200 per item after 5 items
    }

    return Math.round(cost);
}
