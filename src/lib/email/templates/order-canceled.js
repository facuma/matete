export function getOrderCanceledTemplate(order) {
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orden Cancelada</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f4; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        
                        <!-- Header with red background for cancellation -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                    Orden Cancelada
                                </h1>
                                <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">
                                    MATETÉ
                                </p>
                            </td>
                        </tr>

                        <!-- Cancellation Notice -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #991b1b; font-size: 16px; line-height: 1.6;">
                                        <strong>Tu orden ha sido cancelada.</strong><br>
                                        ${order.status === 'Pagado' || order.status === 'Enviado' || order.status === 'Completado'
            ? 'Si ya realizaste el pago, procesaremos el reembolso en los próximos días hábiles.'
            : 'No se ha realizado ningún cargo a tu cuenta.'}
                                    </p>
                                </div>

                                <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px 0;">
                                    Detalles de la Orden
                                </h2>

                                <!-- Order Details -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                                    <tr>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #e7e5e4;">
                                            <span style="color: #78716c; font-size: 14px;">Número de Orden:</span>
                                        </td>
                                        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e7e5e4;">
                                            <span style="color: #1a1a1a; font-weight: bold; font-family: monospace;">${order.id}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #e7e5e4;">
                                            <span style="color: #78716c; font-size: 14px;">Fecha de Creación:</span>
                                        </td>
                                        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e7e5e4;">
                                            <span style="color: #1a1a1a;">${orderDate}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0;">
                                            <span style="color: #78716c; font-size: 14px;">Total de la Orden:</span>
                                        </td>
                                        <td align="right" style="padding: 10px 0;">
                                            <span style="color: #1a1a1a; font-weight: bold; font-size: 18px;">$${order.total.toLocaleString('es-AR')}</span>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Products -->
                                <h3 style="color: #1a1a1a; font-size: 18px; margin: 0 0 15px 0;">
                                    Productos
                                </h3>
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafaf9; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                                    ${order.items.map(item => `
                                        <tr>
                                            <td style="padding: 10px 0;">
                                                <strong style="color: #1a1a1a;">${item.name}</strong><br>
                                                <span style="color: #78716c; font-size: 14px;">Cantidad: ${item.quantity}</span>
                                            </td>
                                            <td align="right" style="padding: 10px 0;">
                                                <span style="color: #1a1a1a;">$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </table>

                                <!-- Refund Information (if paid) -->
                                ${(order.status === 'Pagado' || order.status === 'Enviado' || order.status === 'Completado') ? `
                                <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 20px;">
                                    <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">
                                        💰 Información de Reembolso
                                    </h3>
                                    <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                                        Tu reembolso será procesado en los próximos 5-10 días hábiles. 
                                        El dinero será acreditado al mismo método de pago que utilizaste.
                                    </p>
                                </div>
                                ` : ''}

                                <!-- Contact Information -->
                                <div style="background-color: #fafaf9; padding: 20px; border-radius: 8px; text-align: center;">
                                    <p style="color: #78716c; margin: 0 0 10px 0; font-size: 14px;">
                                        ¿Tienes alguna pregunta sobre la cancelación?
                                    </p>
                                    <p style="margin: 0;">
                                        <a href="mailto:matete@clickarg.com" style="color: #8B5A2B; text-decoration: none; font-weight: bold;">
                                            matete@clickarg.com
                                        </a>
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                                <p style="color: #a8a29e; margin: 0 0 10px 0; font-size: 14px;">
                                    Gracias por tu comprensión
                                </p>
                                <p style="color: #78716c; margin: 0; font-size: 12px;">
                                    © ${new Date().getFullYear()} MATETÉ. Todos los derechos reservados.
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
