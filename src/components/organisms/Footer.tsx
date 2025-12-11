'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react';
import { Typography } from '../atoms/Typography';
import { NavLink } from '../atoms/NavLink';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-stone-900 text-stone-400 py-16">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div>
                    <Typography variant="h3" className="text-white font-serif font-bold text-xl mb-4">MATETÉ</Typography>
                    <Typography variant="small" className="leading-relaxed mb-4 block">
                        Llevando la tradición del mate a otro nivel. Calidad, diseño y pasión argentina.
                    </Typography>
                    <div className="flex gap-4">
                        <Link href="https://www.instagram.com/mateteoficial_/" target="_blank">
                            <Instagram className="hover:text-white cursor-pointer transition-colors" />
                        </Link>
                        <Link href="https://www.facebook.com/mateteoficial_/" target="_blank">
                            <Facebook className="hover:text-white cursor-pointer transition-colors" />
                        </Link>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <Typography variant="h4" className="text-white font-bold mb-4 text-base">Links Rápidos</Typography>
                    <ul className="space-y-2 text-sm">
                        <li><NavLink href="/shop" className="hover:text-white text-stone-400">Ver Tienda</NavLink></li>
                        <li><NavLink href="/blog/como-curar-mate-calabaza-madera-guia-paso-a-paso" className="hover:text-white text-stone-400">Cómo curar el mate</NavLink></li>
                        <li><NavLink href="/cambios-devoluciones" className="hover:text-white text-stone-400">Envíos y Devoluciones</NavLink></li>
                        <li><NavLink href="/my-orders" className="hover:text-white text-stone-400">Mis Pedidos</NavLink></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <Typography variant="h4" className="text-white font-bold mb-4 text-base">Legal</Typography>
                    <ul className="space-y-2 text-sm">
                        <li><NavLink href="/terminos" className="hover:text-white text-stone-400">Términos y Condiciones</NavLink></li>
                        <li><NavLink href="/privacidad" className="hover:text-white text-stone-400">Política de Privacidad</NavLink></li>
                        <li><NavLink href="/cambios-devoluciones" className="hover:text-white text-stone-400">Cambios y Devoluciones</NavLink></li>
                        <li><NavLink href="/politica-de-cookies" className="hover:text-white text-stone-400">Política de Cookies</NavLink></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <Typography variant="h4" className="text-white font-bold mb-4 text-base">Contacto</Typography>
                    <ul className="space-y-2 text-sm">
                        <li className="flex gap-2 items-center"><MapPin size={16} /> Resistencia, Chaco, Arg.</li>
                        <li className="flex gap-2 items-center"><Mail size={16} /> matete@clickarg.com</li>
                    </ul>

                    <Typography variant="h4" className="text-white font-bold mb-2 mt-4 text-sm">Medios de Pago</Typography>
                    <div className="flex gap-2 items-center">
                        <img src="/svg/visa.svg" alt="Visa" className="h-6 w-auto bg-white rounded px-1 opacity-90" />
                        <img src="/svg/mastercard.svg" alt="Mastercard" className="h-6 w-auto bg-white rounded px-1 opacity-90" />
                        <img src="/svg/mercadopago.svg" alt="Mercado Pago" className="h-6 w-auto bg-white rounded px-1 opacity-90" />
                    </div>
                </div>
            </div>

            <div className="border-t border-stone-800 mt-12 pt-8 text-center text-xs text-stone-500">
                © {currentYear} MATETÉ. Todos los derechos reservados.
            </div>
        </footer>
    );
};
