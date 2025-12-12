import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig } from 'mercadopago';

/**
 * Helper to get site settings with MP credentials
 */
async function getSiteSettingsMp() {
    return await prisma.siteSettings.findUnique({
        where: { id: 1 }
    });
}

/**
 * Refresh the MP access token if needed
 * @param {object} settings - The site settings object
 * @returns {Promise<string>} - The valid access token
 */
async function refreshMpTokenIfNeeded(settings) {
    if (!settings?.mpRefreshToken) {
        throw new Error('No refresh token available');
    }

    const now = new Date();
    // Refresh if expired or expiring in less than 5 minutes
    const expiryBuffer = 5 * 60 * 1000;
    const expiresAt = settings.mpExpiresAt ? new Date(settings.mpExpiresAt) : null;

    if (expiresAt && (expiresAt.getTime() - now.getTime() > expiryBuffer)) {
        // Token is still valid
        return settings.mpAccessToken;
    }

    console.log('Mercado Pago token expired or expiring soon, refreshing...');

    try {
        const response = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.mpAccessToken}` // Usually not needed for refresh, but good practice if required by some endpoints. OAuth endpoint uses client_secret.
            },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: settings.mpRefreshToken,
                client_id: process.env.MP_CLIENT_ID,
                client_secret: process.env.MP_CLIENT_SECRET
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to refresh token: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        // Update settings in DB
        const updatedSettings = await prisma.siteSettings.update({
            where: { id: 1 },
            data: {
                mpAccessToken: data.access_token,
                mpRefreshToken: data.refresh_token,
                mpExpiresAt: new Date(Date.now() + (data.expires_in * 1000)),
                mpUserId: data.user_id ? BigInt(data.user_id) : undefined, // Ensure BigInt compatibility
            }
        });

        console.log('Mercado Pago token refreshed successfully.');
        return updatedSettings.mpAccessToken;

    } catch (error) {
        console.error('Error refreshing Mercado Pago token:', error);
        throw error;
    }
}

/**
 * Get a valid Mercado Pago access token.
 * Prioritizes connected account from SiteSettings (id=1).
 * Fallback to env var MERCADOPAGO_ACCESS_TOKEN if not connected.
 * 
 * @returns {Promise<string>} - The access token
 */
export async function getMpToken() {
    // 1. Try to get from SiteSettings
    try {
        const settings = await getSiteSettingsMp();

        if (settings?.mpAccessToken && settings?.mpRefreshToken) {
            // Check expiry and refresh if needed
            return await refreshMpTokenIfNeeded(settings);
        }
    } catch (error) {
        console.warn('Error fetching/refreshing MP token from settings, falling back to env:', error);
    }

    // 2. Fallback to Env Var
    const envToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (envToken) {
        return envToken;
    }

    throw new Error('No valid Mercado Pago access token found (neither in DB nor ENV).');
}

/**
 * Returns a configured MercadoPagoConfig instance
 */
export async function getMpClient() {
    const token = await getMpToken();
    return new MercadoPagoConfig({ accessToken: token });
}
