import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = {
    title: 'Términos y Condiciones | MATETÉ',
    description: 'Términos y condiciones de uso del sitio web y tienda online de MATETÉ. Lee nuestras políticas antes de realizar tu compra.',
};

export default function TerminosPage() {
    return (
        <LegalLayout title="Términos y Condiciones" lastUpdated="Diciembre 2025">
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">1. Aceptación de los Términos</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Al acceder y utilizar el sitio web de MATETÉ, usted acepta estar sujeto a estos Términos y Condiciones de Uso,
                        todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.
                        Si no está de acuerdo con alguno de estos términos, está prohibido usar o acceder a este sitio.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">2. Uso del Sitio</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        El contenido de este sitio web es únicamente para su información general y está sujeto a cambios sin previo aviso.
                    </p>
                    <p className="text-stone-700 leading-relaxed">
                        Usted se compromete a:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2 mt-2">
                        <li>Proporcionar información verdadera, precisa y completa al realizar compras</li>
                        <li>Mantener la seguridad de su cuenta y contraseña</li>
                        <li>No utilizar el sitio para actividades ilegales o no autorizadas</li>
                        <li>No interferir con el funcionamiento del sitio web</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">3. Productos y Precios</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Nos esforzamos por mostrar los precios y productos de manera precisa. Sin embargo, nos reservamos el derecho de:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Corregir errores de precios en cualquier momento</li>
                        <li>Modificar o discontinuar productos sin previo aviso</li>
                        <li>Limitar las cantidades de compra por persona o pedido</li>
                        <li>Rechazar cualquier pedido que consideremos inapropiado</li>
                    </ul>
                    <p className="text-stone-700 leading-relaxed mt-3">
                        Todos los precios están expresados en pesos argentinos (ARS) e incluyen IVA cuando corresponda.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">4. Proceso de Compra</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Al realizar un pedido a través de nuestro sitio web:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Recibirá un correo electrónico de confirmación del pedido</li>
                        <li>La confirmación no constituye aceptación del pedido</li>
                        <li>Nos reservamos el derecho de rechazar pedidos por cualquier motivo</li>
                        <li>El contrato de venta se perfecciona cuando enviamos la confirmación de despacho</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">5. Métodos de Pago</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Aceptamos los siguientes métodos de pago:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Tarjetas de crédito y débito (Visa, Mastercard)</li>
                        <li>MercadoPago</li>
                        <li>Transferencia bancaria</li>
                    </ul>
                    <p className="text-stone-700 leading-relaxed mt-3">
                        Todos los pagos están sujetos a verificación y aprobación. Nos reservamos el derecho de cancelar
                        transacciones que consideremos fraudulentas o sospechosas.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">6. Envíos</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Los plazos de entrega son estimados y no garantizados. MATETÉ no se hace responsable por retrasos
                        causados por el servicio de mensajería o circunstancias fuera de nuestro control. Para más información,
                        consulte nuestra Política de Cambios y Devoluciones.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">7. Propiedad Intelectual</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Todo el contenido incluido en este sitio, como texto, gráficos, logotipos, imágenes, clips de audio,
                        descargas digitales y compilaciones de datos, es propiedad de MATETÉ o de sus proveedores de contenido
                        y está protegido por las leyes argentinas e internacionales de derechos de autor.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">8. Limitación de Responsabilidad</h2>
                    <p className="text-stone-700 leading-relaxed">
                        MATETÉ no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos,
                        incluidos, entre otros, pérdida de beneficios, datos, uso, fondo de comercio u otras pérdidas intangibles,
                        que resulten de su acceso o uso del sitio web o de cualquier producto comprado.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">9. Modificaciones</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán
                        en vigor inmediatamente después de su publicación en el sitio web. Su uso continuado del sitio después
                        de cualquier cambio constituye su aceptación de los nuevos términos.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">10. Ley Aplicable</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Estos términos se regirán e interpretarán de acuerdo con las leyes de la República Argentina.
                        Cualquier disputa que surja en relación con estos términos estará sujeta a la jurisdicción exclusiva
                        de los tribunales de Resistencia, Chaco, Argentina.
                    </p>
                </div>

                <div className="border-t border-stone-200 pt-6 mt-8">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Contacto</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos en:
                    </p>
                    <p className="text-stone-700 mt-2">
                        <strong>Email:</strong> matete@clickarg.com<br />
                        <strong>Dirección:</strong> Resistencia, Chaco, Argentina
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
