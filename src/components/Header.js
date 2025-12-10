'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingBag, Menu, User, LogOut, Settings } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartCount, setIsCartOpen } = useCart();
    const { data: session } = useSession();
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Inicio' },
        { href: '/shop', label: 'Productos' },
        { href: '/blog', label: 'Blog' },
    ];

    return (
        <header className={`fixed w-full z-50 transition-all duration-300 ${pathname === '/' ? 'bg-[#1a1a1a]/90 backdrop-blur-md' : 'bg-[#1a1a1a]'} text-white`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu />
                </button>

                <Link href="/" className="text-2xl font-serif font-bold tracking-wider cursor-pointer flex items-center gap-2">
                    MATETÉ <span className="text-2xl">🧉</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className={`hover:text-[#D4A373] transition-colors ${pathname === link.href ? 'text-[#D4A373]' : ''}`}>
                            {link.label}
                        </Link>
                    ))}

                    {session?.user ? (
                        <>
                            {session.user.role === 'admin' ? (
                                <Link href="/admin" className={`hover:text-[#D4A373] transition-colors flex items-center gap-1 ${pathname.startsWith('/admin') ? 'text-[#D4A373]' : ''}`}>
                                    <Settings size={18} />
                                    Administrar Tienda
                                </Link>
                            ) : (
                                <Link href="/my-orders" className={`hover:text-[#D4A373] transition-colors flex items-center gap-1 ${pathname === '/my-orders' ? 'text-[#D4A373]' : ''}`}>
                                    <User size={18} />
                                    Mis Pedidos
                                </Link>
                            )}
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="hover:text-[#D4A373] transition-colors flex items-center gap-1"
                            >
                                <LogOut size={18} />
                                Salir
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="hover:text-[#D4A373] transition-colors flex items-center gap-1">
                            <User size={18} />
                            Iniciar Sesión
                        </Link>
                    )}
                </nav>

                <div className="relative cursor-pointer hover:text-[#D4A373] transition-colors" onClick={() => setIsCartOpen(true)}>
                    <ShoppingBag />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#8B5A2B] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                            {cartCount}
                        </span>
                    )}
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-[#1a1a1a] border-t border-stone-800 p-4 absolute w-full flex flex-col gap-4 shadow-xl">
                    {navLinks.map(link => <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-left py-2 hover:text-[#D4A373]">{link.label}</Link>)}
                    {session?.user ? (
                        <>
                            {session.user.role === 'admin' ? (
                                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-left py-2 hover:text-[#D4A373] flex items-center gap-2">
                                    <Settings size={18} /> Administrar Tienda
                                </Link>
                            ) : (
                                <Link href="/my-orders" onClick={() => setIsMenuOpen(false)} className="text-left py-2 hover:text-[#D4A373] flex items-center gap-2">
                                    <User size={18} /> Mis Pedidos
                                </Link>
                            )}
                            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left py-2 hover:text-[#D4A373] flex items-center gap-2">
                                <LogOut size={18} /> Salir
                            </button>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-left py-2 hover:text-[#D4A373] flex items-center gap-2">
                            <User size={18} /> Iniciar Sesión
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}