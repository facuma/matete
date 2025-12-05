export function getOrderConfirmationTemplate(order) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                <strong>${item.quantity}x</strong> ${item.name}
                ${item.options && Object.keys(item.options).length > 0
            ? `<br><span style="font-size: 12px; color: #666;">
                        ${Object.values(item.options).map(opt => `+ ${opt.name}`).join(', ')}
                       </span>`
            : ''
        }
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
                $${(item.price * item.quantity).toLocaleString('es-AR')}
            </td>
        </tr>
    `).join('');

    const shippingInfo = order.shippingMethod
        ? `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                <strong>Envío:</strong> ${order.shippingMethod}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
                $${order.shippingCost?.toLocaleString('es-AR') || '0'}
            </td>
           </tr>`
        : '';

    const paymentInstructions = order.paymentMethod === 'transfer'
        ? `
        <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; color: #92400E; font-size: 16px;">⚠️ Instrucciones de Pago</h3>
            <p style="margin: 0 0 8px 0; color: #78350F;">Por favor, realizá la transferencia a los siguientes datos:</p>
            <div style="background-color: white; padding: 12px; border-radius: 4px; margin: 8px 0;">
                <p style="margin: 4px 0; font-size: 14px;"><strong>Banco:</strong> Banco Galicia</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Titular:</strong> MATETE SHOP S.A.</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>CBU:</strong> 0070000000000000000000</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Alias:</strong> MATETE.SHOP.MP</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Monto:</strong> $${order.total.toLocaleString('es-AR')}</p>
            </div>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #78350F;">
                Una vez realizada la transferencia, envianos el comprobante por WhatsApp al <strong>+54 9 362 4123456</strong> 
                indicando tu número de orden: <strong>${order.id}</strong>
            </p>
        </div>
        `
        : `
        <div style="background-color: #DBEAFE; border: 1px solid #3B82F6; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #1E40AF; font-size: 14px;">
                ✅ Tu pago con MercadoPago está siendo procesado. Te notificaremos cuando se confirme.
            </p>
        </div>
        `;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pedido - MATETÉ</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f4; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B5A2B 0%, #654321 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">MATETÉ</h1>
                            <p style="color: #E8D5C4; margin: 8px 0 0 0; font-size: 14px;">El ritual de cada día</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px;">¡Recibimos tu pedido!</h2>
                            <p style="color: #666; margin: 0 0 24px 0; line-height: 1.6;">
                                Hola <strong>${order.customerName}</strong>, confirmamos que tu pedido ha sido recibido correctamente. 
                                Te mantendremos informado sobre el estado de tu compra.
                            </p>
                            
                            <!-- Order Info -->
                            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
                                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Número de Orden</p>
                                <p style="margin: 0; color: #1a1a1a; font-size: 20px; font-weight: bold;">#${order.id}</p>
                            </div>
                            
                            ${paymentInstructions}
                            
                            <!-- Items Table -->
                            <h3 style="color: #1a1a1a; margin: 32px 0 16px 0; font-size: 18px;">Resumen del Pedido</h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                                ${itemsHtml}
                                ${shippingInfo}
                                <tr style="background-color: #f9f9f9;">
                                    <td style="padding: 16px; font-size: 18px; font-weight: bold;">
                                        Total
                                    </td>
                                    <td style="padding: 16px; text-align: right; font-size: 18px; font-weight: bold; color: #8B5A2B;">
                                        $${order.total.toLocaleString('es-AR')}
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Shipping Address -->
                            <h3 style="color: #1a1a1a; margin: 32px 0 16px 0; font-size: 18px;">Datos de Envío</h3>
                            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                                <p style="margin: 0 0 4px 0; color: #1a1a1a; font-weight: 600;">${order.customerName}</p>
                                <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${order.customerAddress}</p>
                                <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${order.customerCity}</p>
                                ${order.customerEmail ? `<p style="margin: 0; color: #666; font-size: 14px;">${order.customerEmail}</p>` : ''}
                            </div>
                            
                            <!-- Help Section -->
                            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
                                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">¿Necesitás ayuda?</p>
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    Contactanos por WhatsApp: <a href="https://wa.me/5493624123456" style="color: #8B5A2B; text-decoration: none;"><strong>+54 9 362 4123456</strong></a><br>
                                    O por email: <a href="mailto:matete@clickarg.com" style="color: #8B5A2B; text-decoration: none;">matete@clickarg.com</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 24px 30px; text-align: center;">
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                © ${new Date().getFullYear()} MATETÉ - El ritual de cada día<br>
                                Resistencia, Chaco - Argentina
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}
