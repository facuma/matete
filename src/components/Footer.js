'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-stone-900 text-stone-400 py-16">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                <div>
                    <h3 className="text-white font-serif font-bold text-xl mb-4">MATETÉ</h3>
                    <p className="text-sm leading-relaxed mb-4">
                        Llevando la tradición del mate a otro nivel. Calidad, diseño y pasión argentina.
                    </p>
                    <div className="flex gap-4">
                        <Link href="https://www.instagram.com/mateteoficial_/" target="_blank"><Instagram className="hover:text-white cursor-pointer" /></Link>
                        <Link href="https://www.facebook.com/mateteoficial_/" target="_blank"><Facebook className="hover:text-white cursor-pointer" /></Link>
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/shop" className="cursor-pointer hover:text-white">Ver Tienda</Link></li>
                        <li className="cursor-pointer hover:text-white"><Link href="/blog/como-curar-mate-calabaza-madera-guia-paso-a-paso">Cómo curar el mate</Link></li>
                        <li className="cursor-pointer hover:text-white">Envíos y Devoluciones</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Contacto</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex gap-2"><MapPin size={16} /> Resistencia, Chaco, Arg.</li>
                        <li className="flex gap-2"><Mail size={16} /> hola@matete.com.ar</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Medios de Pago</h4>
                    <div className="flex gap-3 items-center">
                        <img src="/svg/visa.svg" alt="Visa" className="h-8 w-auto bg-white rounded px-1" />
                        <img src="/svg/mastercard.svg" alt="Mastercard" className="h-8 w-auto bg-white rounded px-1" />
                        <img src="/svg/mercadopago.svg" alt="Mercado Pago" className="h-8 w-auto bg-white rounded px-1" />
                    </div>
                </div>
            </div>
            <div className="border-t border-stone-800 mt-12 pt-8 text-center text-xs">
                © {new Date().getFullYear()} MATETÉ. Todos los derechos reservados.
            </div>
        </footer>
    );
}