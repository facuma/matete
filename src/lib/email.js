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
/**
 * Send verification email
 * @param {Object} params - { to, code, name }
 * @returns {Promise<Object>} Resend response
 */
export async function sendVerificationEmail({ to, code, name }) {
    try {
        if (!resend) {
            console.warn('Resend not configured, skipping verification email');
            return { success: false, error: 'Email service not configured' };
        }

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a1a1a; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verifica tu correo electrónico</h1>
        <p>Hola ${name},</p>
        <p>Gracias por registrarte en MATETÉ. Para completar tu registro, por favor ingresa el siguiente código:</p>
        <div class="code">${code}</div>
        <p>Este código expira en 15 minutos.</p>
        <div class="footer">
            <p>Si no solicitaste este código, puedes ignorar este correo.</p>
        </div>
    </div>
</body>
</html>
        `;

        const result = await resend.emails.send({
            from: fromEmail,
            to,
            subject: `Código de verificación: ${code} - MATETÉ`,
            html
        });

        console.log('Verification email sent:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error: error.message };
    }
}
