export function getPaymentApprovedTemplate(order) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                <strong>${item.quantity}x</strong> ${item.name}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
                $${(item.price * item.quantity).toLocaleString('es-AR')}
            </td>
        </tr>
    `).join('');

    const deliveryEstimate = order.shippingMethod === 'Retiro en Local'
        ? 'Tu pedido estará listo para retiro en 1-2 días hábiles. Te avisaremos cuando puedas pasar a buscarlo.'
        : `Tu pedido será despachado en las próximas 24-48 horas. Recibirás un email con el número de seguimiento.`;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Aprobado - MATETÉ</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f4; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
                            <div style="background-color: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 32px;">✓</span>
                            </div>
                            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">PAGO CONFIRMADO</h1>
                            <p style="color: #D1FAE5; margin: 8px 0 0 0; font-size: 14px;">¡Tu compra fue procesada exitosamente!</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px;">¡Gracias por tu compra, ${order.customerName}!</h2>
                            <p style="color: #666; margin: 0 0 24px 0; line-height: 1.6;">
                                Tu pago ha sido aprobado y confirmado. Ya estamos preparando tu pedido para el envío.
                            </p>
                            
                            <!-- Success Badge -->
                            <div style="background-color: #D1FAE5; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                                <p style="margin: 0; color: #065F46; font-size: 16px; font-weight: 600;">
                                    ✅ Pago procesado exitosamente
                                </p>
                            </div>
                            
                            <!-- Order Info -->
                            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <p style="margin: 0; color: #666; font-size: 14px;">Número de Orden</p>
                                            <p style="margin: 4px 0 0 0; color: #1a1a1a; font-size: 18px; font-weight: bold;">#${order.id}</p>
                                        </td>
                                    </tr>
                                    ${order.mercadopagoPaymentId ? `
                                    <tr>
                                        <td style="padding: 8px 0; border-top: 1px solid #e5e5e5;">
                                            <p style="margin: 0; color: #666; font-size: 14px;">ID de Pago MercadoPago</p>
                                            <p style="margin: 4px 0 0 0; color: #1a1a1a; font-size: 14px;">${order.mercadopagoPaymentId}</p>
                                        </td>
                                    </tr>
                                    ` : ''}
                                </table>
                            </div>
                            
                            <!-- Delivery Info -->
                            <div style="background-color: #DBEAFE; border-left: 4px solid #3B82F6; border-radius: 4px; padding: 16px; margin: 24px 0;">
                                <p style="margin: 0 0 8px 0; color: #1E40AF; font-weight: 600;">📦 Próximos Pasos</p>
                                <p style="margin: 0; color: #1E3A8A; font-size: 14px; line-height: 1.5;">
                                    ${deliveryEstimate}
                                </p>
                            </div>
                            
                            <!-- Items Table -->
                            <h3 style="color: #1a1a1a; margin: 32px 0 16px 0; font-size: 18px;">Detalle de tu Compra</h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                                ${itemsHtml}
                                ${order.shippingCost > 0 ? `
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                                        <strong>Envío:</strong> ${order.shippingMethod}
                                    </td>
                                    <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
                                        $${order.shippingCost.toLocaleString('es-AR')}
                                    </td>
                                </tr>
                                ` : ''}
                                <tr style="background-color: #f9f9f9;">
                                    <td style="padding: 16px; font-size: 18px; font-weight: bold;">
                                        Total Pagado
                                    </td>
                                    <td style="padding: 16px; text-align: right; font-size: 18px; font-weight: bold; color: #059669;">
                                        $${order.total.toLocaleString('es-AR')}
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Tracking Info -->
                            <div style="margin-top: 32px; padding: 20px; background-color: #FEF3C7; border-radius: 8px; border: 1px solid #F59E0B;">
                                <h4 style="margin: 0 0 12px 0; color: #92400E; font-size: 16px;">📍 Seguimiento del Envío</h4>
                                <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.5;">
                                    En las próximas horas recibirás un email con el número de seguimiento para que puedas rastrear tu pedido. 
                                    Mientras tanto, podés revisar el estado de tu orden en nuestra página.
                                </p>
                            </div>
                            
                            <!-- Help Section -->
                            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
                                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">¿Tenés alguna consulta?</p>
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
                            <p style="margin: 0 0 8px 0; color: white; font-size: 20px; font-weight: bold; letter-spacing: 2px;">MATETÉ</p>
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                El ritual de cada día<br>
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
