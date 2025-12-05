import LegalLayout from '@/components/legal/LegalLayout';
import Link from 'next/link';

export const metadata = {
    title: 'Política de Cambios y Devoluciones | MATETÉ',
    description: 'Conoce nuestra política de cambios y devoluciones. En MATETÉ queremos que estés 100% satisfecho con tu compra.',
};

export default function CambiosDevolucionesPage() {
    return (
        <LegalLayout title="Política de Cambios y Devoluciones" lastUpdated="Diciembre 2025">
            <section className="space-y-6">
                <div>
                    <p className="text-stone-700 leading-relaxed">
                        En MATETÉ nos esforzamos por ofrecerte productos de la más alta calidad. Si no estás completamente
                        satisfecho con tu compra, estamos aquí para ayudarte. Lee atentamente nuestra política de cambios
                        y devoluciones.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">1. Plazo para Cambios y Devoluciones</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Tienes <strong>10 días corridos</strong> desde la recepción de tu pedido para solicitar un cambio
                        o devolución, de acuerdo con la Ley de Defensa del Consumidor N° 24.240 (Artículo 34).
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">2. Condiciones para Cambios y Devoluciones</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Para que tu solicitud sea aceptada, el producto debe cumplir con las siguientes condiciones:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>El producto debe estar en su estado original, sin usar y sin daños</li>
                        <li>Debe conservar su embalaje original en perfectas condiciones</li>
                        <li>Incluir todas las etiquetas, accesorios y documentación original</li>
                        <li>No debe presentar signos de uso, rayones, manchas o modificaciones</li>
                        <li>Presentar comprobante de compra (factura o recibo de confirmación)</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">3. Productos No Retornables</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Por razones de higiene y seguridad, los siguientes productos NO pueden ser devueltos o cambiados
                        una vez abiertos o usados:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Bombillas (una vez usadas)</li>
                        <li>Productos personalizados o hechos bajo pedido</li>
                        <li>Productos en oferta o liquidación (salvo defectos de fabricación)</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">4. Cómo Solicitar un Cambio o Devolución</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Para iniciar el proceso de cambio o devolución:
                    </p>
                    <ol className="list-decimal pl-6 text-stone-700 space-y-3">
                        <li>
                            <strong>Contáctanos:</strong> Envía un email a matete@clickarg.com o contacta por WhatsApp
                            indicando:
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Número de pedido</li>
                                <li>Producto(s) a devolver o cambiar</li>
                                <li>Motivo de la devolución/cambio</li>
                                <li>Fotos del producto (si aplica)</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Espera nuestra respuesta:</strong> Nuestro equipo revisará tu solicitud en un plazo
                            máximo de 48 horas hábiles.
                        </li>
                        <li>
                            <strong>Envío del producto:</strong> Una vez aprobada tu solicitud, te enviaremos las
                            instrucciones para el envío del producto.
                        </li>
                        <li>
                            <strong>Verificación:</strong> Al recibir el producto, verificaremos que cumpla con las
                            condiciones establecidas.
                        </li>
                    </ol>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">5. Costos de Envío</h2>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">5.1 Producto Defectuoso o Error Nuestro</h3>
                    <p className="text-stone-700 leading-relaxed">
                        Si el producto presenta defectos de fabricación o si cometimos un error en tu pedido, MATETÉ se
                        hará cargo del 100% de los costos de envío (ida y vuelta).
                    </p>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">5.2 Arrepentimiento de Compra</h3>
                    <p className="text-stone-700 leading-relaxed">
                        Si deseas devolver el producto por arrepentimiento (sin defectos), el costo del envío de retorno
                        será a tu cargo. Te recomendaremos opciones de envío económicas.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">6. Reembolsos</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Una vez que recibamos y verifiquemos tu devolución:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Procesaremos el reembolso en un plazo máximo de 10 días hábiles</li>
                        <li>El dinero será devuelto al mismo método de pago original</li>
                        <li>Para transferencias, necesitaremos tus datos bancarios (CBU/CVU)</li>
                        <li>Recibirás un email de confirmación cuando se procese el reembolso</li>
                    </ul>
                    <p className="text-stone-700 leading-relaxed mt-3">
                        <strong>Nota:</strong> El tiempo que tarde en reflejarse el reembolso en tu cuenta dependerá de
                        tu banco o entidad financiera.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">7. Cambios</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Si deseas cambiar un producto por otro:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2 mt-2">
                        <li>Aplican las mismas condiciones que para devoluciones</li>
                        <li>Si hay diferencia de precio, deberás abonar o se te reembolsará la diferencia</li>
                        <li>El producto de reemplazo estará sujeto a disponibilidad de stock</li>
                        <li>Los gastos de envío del nuevo producto serán a cargo de MATETÉ (si el cambio es por defecto)</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">8. Productos Defectuosos o Dañados</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Si recibes un producto defectuoso o dañado:
                    </p>
                    <ol className="list-decimal pl-6 text-stone-700 space-y-2">
                        <li>Toma fotos del empaque y del defecto/daño</li>
                        <li>Contáctanos inmediatamente (máximo 48 horas desde la recepción)</li>
                        <li>Te enviaremos un reemplazo o procesaremos el reembolso completo</li>
                        <li>Todos los costos serán cubiertos por MATETÉ</li>
                    </ol>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">9. Garantía</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Todos nuestros productos cuentan con garantía contra defectos de fabricación por 30 días desde
                        la recepción del pedido. Esta garantía no cubre el desgaste normal por uso ni daños causados por
                        mal uso del producto.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">10. Envíos y Tiempos de Entrega</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        <strong>Áreas de Envío:</strong> Realizamos envíos a todo el país a través de correo argentino
                        y empresas de mensajería confiables.
                    </p>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        <strong>Tiempos Estimados:</strong>
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Capital Federal y GBA: 2-5 días hábiles</li>
                        <li>Interior del país: 5-10 días hábiles</li>
                        <li>Zonas remotas: 10-15 días hábiles</li>
                    </ul>
                    <p className="text-stone-700 leading-relaxed mt-3">
                        Los tiempos son estimados y pueden variar según la ubicación y el servicio de mensajería.
                        MATETÉ no se hace responsable por demoras del servicio de correo.
                    </p>
                </div>

                <div className="bg-stone-100 rounded-lg p-6 mt-8">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">¿Necesitas Ayuda?</h2>
                    <p className="text-stone-700 leading-relaxed mb-4">
                        Nuestro equipo está aquí para ayudarte. No dudes en contactarnos:
                    </p>
                    <div className="space-y-2 text-stone-700">
                        <p><strong>Email:</strong> matete@clickarg.com</p>
                        <p><strong>WhatsApp:</strong> Disponible en nuestra página web</p>
                        <p><strong>Horario de Atención:</strong> Lunes a Viernes 9:00 - 18:00 hs</p>
                    </div>
                    <Link
                        href="/my-orders"
                        className="inline-block mt-4 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors"
                    >
                        Ver Mis Pedidos
                    </Link>
                </div>
            </section>
        </LegalLayout>
    );
}
