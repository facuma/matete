import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = {
    title: 'Política de Cookies | MATETÉ',
    description: 'Política de cookies de MATETÉ. Conoce cómo utilizamos las cookies para mejorar tu experiencia.',
};

export default function PoliticaCookiesPage() {
    return (
        <LegalLayout title="Política de Cookies" lastUpdated="Diciembre 2025">
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">¿Qué son las cookies?</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Las cookies son pequeños archivos de texto que los sitios web almacenan en su computadora
                        o dispositivo móvil cuando usted los visita. Permiten que el sitio web recuerde sus
                        acciones y preferencias (como inicio de sesión, idioma, tamaño de fuente y otras
                        preferencias de visualización) durante un período de tiempo, por lo que no tiene que
                        volver a ingresarlas cada vez que regresa al sitio o navega de una página a otra.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">¿Cómo utilizamos las cookies?</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        En MATETÉ utilizamos cookies para diversos fines, que incluyen:
                    </p>
                    <ul className="list-disc pl-6 text-stone-700 space-y-2">
                        <li>Habilitar el funcionamiento básico del sitio web (cookies esenciales).</li>
                        <li>Recordar sus preferencias y configuraciones.</li>
                        <li>Mejorar la seguridad y prevenir actividades fraudulentas.</li>
                        <li>Analizar cómo se utiliza nuestro sitio web para mejorar el rendimiento y la experiencia del usuario.</li>
                        <li>Mostrar contenido y publicidad relevante para sus intereses.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Tipos de cookies que utilizamos</h2>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">1. Cookies Estrictamente Necesarias</h3>
                    <p className="text-stone-700 leading-relaxed mb-2">
                        Estas cookies son fundamentales para que pueda navegar por el sitio web y utilizar sus funciones,
                        como acceder a áreas seguras. Sin estas cookies, no se pueden proporcionar servicios solicitados,
                        como el carrito de compras.
                    </p>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">2. Cookies de Rendimiento y Análisis</h3>
                    <p className="text-stone-700 leading-relaxed mb-2">
                        Estas cookies recopilan información sobre cómo los visitantes utilizan un sitio web, por ejemplo,
                        qué páginas visitan con más frecuencia y si reciben mensajes de error. Estas cookies no recopilan
                        información que identifique a un visitante. Toda la información que recopilan es agregada y, por lo tanto, anónima.
                    </p>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">3. Cookies de Funcionalidad</h3>
                    <p className="text-stone-700 leading-relaxed mb-2">
                        Permiten que el sitio web recuerde las elecciones que realiza (como su nombre de usuario, idioma o región)
                        y proporcione características mejoradas y más personales.
                    </p>

                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 mt-4">4. Cookies de Publicidad y Marketing</h3>
                    <p className="text-stone-700 leading-relaxed mb-2">
                        Se utilizan para rastrear a los visitantes en los sitios web. La intención es mostrar anuncios que
                        sean relevantes y atractivos para el usuario individual y, por lo tanto, más valiosos para los
                        editores y anunciantes externos.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Gestión de cookies</h2>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        Puede controlar y/o eliminar las cookies según lo desee. Puede eliminar todas las cookies que
                        ya están en su computadora y puede configurar la mayoría de los navegadores para que no las acepten.
                        Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada
                        vez que visite un sitio y que algunos servicios y funcionalidades no funcionen.
                    </p>
                    <p className="text-stone-700 leading-relaxed">
                        Para más información sobre cómo gestionar las cookies en su navegador, visite el centro de ayuda
                        de su navegador web (Chrome, Firefox, Safari, Edge, etc.).
                    </p>
                </div>

                <div className="border-t border-stone-200 pt-6 mt-8">
                    <p className="text-stone-700 leading-relaxed">
                        Si tiene preguntas sobre nuestra Política de Cookies, contáctenos en <a href="mailto:matete@clickarg.com" className="text-[#B05C3C] hover:underline">matete@clickarg.com</a>
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
