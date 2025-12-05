import { Resend } from 'resend';
import { getOrderConfirmationTemplate } from './email/templates/order-confirmation';
import { getPaymentApprovedTemplate } from './email/templates/payment-approved';
import { getOrderCanceledTemplate } from './email/templates/order-canceled';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'MATETÉ <matete@clickarg.com>';

/**
 * Send order confirmation email
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Resend response
 */
export async function sendOrderConfirmation(order) {
    try {
        if (!resend) {
            console.warn('Resend not configured, skipping order confirmation email');
            return { success: false, error: 'Email service not configured' };
        }

        if (!order.customerEmail) {
            console.warn('No customer email provided for order:', order.id);
            return { success: false, error: 'No email provided' };
        }

        const html = getOrderConfirmationTemplate(order);

        const result = await resend.emails.send({
            from: fromEmail,
            to: order.customerEmail,
            subject: `Confirmación de Pedido #${order.id} - MATETÉ`,
            html
        });

        console.log('Order confirmation email sent:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send payment approved email
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Resend response
 */
export async function sendPaymentApproved(order) {
    try {
        if (!resend) {
            console.warn('Resend not configured, skipping payment approved email');
            return { success: false, error: 'Email service not configured' };
        }

        if (!order.customerEmail) {
            console.warn('No customer email provided for order:', order.id);
            return { success: false, error: 'No email provided' };
        }

        const html = getPaymentApprovedTemplate(order);

        const result = await resend.emails.send({
            from: fromEmail,
            to: order.customerEmail,
            subject: `✅ Pago Confirmado - Pedido #${order.id} - MATETÉ`,
            html
        });

        console.log('Payment approved email sent:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error sending payment approved email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send generic email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise<Object>} Resend response
 */
export async function sendEmail(to, subject, html) {
    try {
        if (!resend) {
            console.warn('Resend not configured, skipping email send');
            return { success: false, error: 'Email service not configured' };
        }

        const result = await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html
        });

        console.log('Email sent:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send order canceled email
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Resend response
 */
export async function sendOrderCanceled(order) {
    try {
        if (!resend) {
            console.warn('Resend not configured, skipping order canceled email');
            return { success: false, error: 'Email service not configured' };
        }

        if (!order.customerEmail) {
            console.warn('No customer email provided for order:', order.id);
            return { success: false, error: 'No email provided' };
        }

        const html = getOrderCanceledTemplate(order);

        const result = await resend.emails.send({
            from: fromEmail,
            to: order.customerEmail,
            subject: `Orden Cancelada - #${order.id} - MATETÉ`,
            html
        });

        console.log('Order canceled email sent:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error sending order canceled email:', error);
        return { success: false, error: error.message };
    }
}
