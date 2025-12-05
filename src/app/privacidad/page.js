import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = {
    title: 'Política de Privacidad | MATETÉ',
    description: 'Política de privacidad de MATETÉ. Conoce cómo recopilamos, usamos y protegemos tu información personal.',
};

export default function PrivacidadPage() {
    return (
        <LegalLayout title="Política de Privacidad" lastUpdated="Diciembre 2025">
            <section className="space-y-6">
                <div>
                    <p className="text-stone-700 leading-relaxed">
                        En MATETÉ, nos comprometemos a proteger su privacidad. Esta Política de Privacidad explica cómo
                        recopilamos, usamos, divulgamos y protegemos su información cuando visita nuestro sitio web y
                        realiza compras.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">1. Información que Recopilamos</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Recopilamos diferentes tipos de información para proporcionarle nuestros servicios:
                    </p>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">1.1 Información Personal</h3>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Nombre completo</li>
                        <li>Dirección de correo electrónico</li>
                        <li>Número de teléfono</li>
                        <li>Dirección de envío y facturación</li>
                        <li>DNI (cuando sea requerido)</li>
                        <li>Información de pago (procesada de manera segura por nuestros proveedores)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">1.2 Información de Navegación</h3>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Dirección IP</li>
                        <li>Tipo de navegador y versión</li>
                        <li>Sistema operativo</li>
                        <li>Páginas visitadas y tiempo de permanencia</li>
                        <li>Productos visualizados y comprados</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">2. Cómo Usamos su Información</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Utilizamos la información recopilada para:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Procesar y gestionar sus pedidos</li>
                        <li>Comunicarnos con usted sobre su pedido</li>
                        <li>Mejorar nuestro sitio web y experiencia de usuario</li>
                        <li>Enviarle información promocional (solo si ha dado su consentimiento)</li>
                        <li>Prevenir fraudes y mantener la seguridad del sitio</li>
                        <li>Cumplir con obligaciones legales y fiscales</li>
                        <li>Personalizar su experiencia de compra</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">3. Cookies y Tecnologías Similares</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web:
                    </p>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">3.1 Cookies Esenciales</h3>
                    <p className="text-stone-700 leading-relaxed">
                        Necesarias para el funcionamiento básico del sitio, como mantener su carrito de compras y sesión activa.
                    </p>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">3.2 Cookies Analíticas</h3>
                    <p className="text-stone-700 leading-relaxed">
                        Nos ayudan a comprender cómo los visitantes interactúan con nuestro sitio web mediante la recopilación
                        de información de forma anónima.
                    </p>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">3.3 Cookies de Marketing</h3>
                    <p className="text-stone-700 leading-relaxed mb-2">
                        Utilizamos servicios de terceros para publicidad y análisis:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li><strong>Meta Pixel (Facebook):</strong> Para medir la efectividad de la publicidad y mostrar anuncios relevantes</li>
                        <li><strong>Google Ads:</strong> Para remarketing y seguimiento de conversiones</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">4. Compartir Información con Terceros</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Compartimos su información solo en las siguientes circunstancias:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li><strong>Procesadores de Pago:</strong> MercadoPago y otros proveedores de servicios de pago</li>
                        <li><strong>Servicios de Envío:</strong> Empresas de mensajería para entregar sus pedidos</li>
                        <li><strong>Plataformas de Marketing:</strong> Meta (Facebook), Google para publicidad dirigida</li>
                        <li><strong>Cumplimiento Legal:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
                    </ul>
                    <p className="text-stone-700 leading-relaxed mt-3">
                        Nunca vendemos su información personal a terceros.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">5. Seguridad de la Información</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal
                        contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2 mt-2">
                        <li>Cifrado SSL/TLS para transmisión de datos</li>
                        <li>Almacenamiento seguro de contraseñas</li>
                        <li>Acceso limitado a información personal</li>
                        <li>Revisiones regulares de seguridad</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">6. Sus Derechos</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        De acuerdo con la Ley de Protección de Datos Personales N° 25.326 de Argentina, usted tiene derecho a:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li><strong>Acceso:</strong> Solicitar una copia de su información personal</li>
                        <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                        <li><strong>Supresión:</strong> Solicitar la eliminación de su información personal</li>
                        <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos personales</li>
                        <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
                        <li><strong>Retirar Consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
                    </ul>
                    <p className="text-stone-700 leading-relaxed mt-3">
                        Para ejercer estos derechos, contáctenos en matete@clickarg.com
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">7. Retención de Datos</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos
                        descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
                        Los datos de pedidos se conservan por motivos fiscales y contables según lo exige la legislación argentina.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">8. Menores de Edad</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Nuestro sitio web no está dirigido a menores de 18 años. No recopilamos intencionalmente información
                        personal de menores. Si descubrimos que hemos recopilado información de un menor sin el consentimiento
                        parental verificable, eliminaremos esa información de nuestros servidores.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">9. Enlaces a Sitios de Terceros</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Nuestro sitio web puede contener enlaces a sitios de terceros. No somos responsables de las prácticas
                        de privacidad de estos sitios. Le recomendamos leer las políticas de privacidad de cada sitio que visite.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">10. Cambios a esta Política</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos cualquier cambio
                        publicando la nueva política en esta página y actualizando la fecha de "última actualización".
                        Le recomendamos revisar esta política periódicamente.
                    </p>
                </div>

                <div className="border-t border-stone-200 pt-6 mt-8">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Contacto</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, contáctenos:
                    </p>
                    <p className="text-stone-700 mt-2">
                        <strong>Email:</strong> matete@clickarg.com<br />
                        <strong>Responsable de Datos:</strong> MATETÉ<br />
                        <strong>Dirección:</strong> Resistencia, Chaco, Argentina
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
