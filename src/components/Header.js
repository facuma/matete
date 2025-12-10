'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingBag, Menu, User, LogOut, Settings } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useCategories } from '@/contexts/category-context';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartCount, setIsCartOpen } = useCart();
    const { data: session } = useSession();
    const pathname = usePathname();
    const { categories } = useCategories();
    const navbarCategories = categories.filter(c => c.showInNavbar);
    const [activeDropdown, setActiveDropdown] = useState(null);


    const navLinks = [
        { href: '/', label: 'Inicio' },
        { href: '/shop', label: 'Productos', hasDropdown: true },
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

                <nav className="hidden md:flex items-center gap-6 relative">
                    {navLinks.map(link => {
                        if (link.hasDropdown && navbarCategories.length > 0) {
                            return (
                                <div
                                    key={link.href}
                                    className="relative group h-20 flex items-center"
                                    onMouseEnter={() => setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link href={link.href} className={`hover:text-[#D4A373] transition-colors ${pathname === link.href ? 'text-[#D4A373]' : ''}`}>
                                        {link.label}
                                    </Link>

                                    {/* Dropdown Menu */}
                                    <div className="absolute top-20 left-0 bg-[#1a1a1a] shadow-xl border-t-2 border-[#D4A373] min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                        <div className="py-2">
                                            <Link href="/shop" className="block px-4 py-2 hover:bg-[#2a2a2a] text-sm text-[#D4A373] font-semibold border-b border-white/10">
                                                Ver Todo
                                            </Link>
                                            {navbarCategories.map(cat => (
                                                <div key={cat.id} className="relative group/sub">
                                                    <Link
                                                        href={`/categorias/${cat.slug}`}
                                                        className="block px-4 py-2 hover:bg-[#2a2a2a] text-sm hover:text-[#D4A373] flex justify-between items-center"
                                                    >
                                                        {cat.name}
                                                        {cat.children && cat.children.length > 0 && <span className="text-xs">›</span>}
                                                    </Link>
                                                    {/* Submenu Level 2 */}
                                                    {cat.children && cat.children.length > 0 && (
                                                        <div className="absolute left-full top-0 bg-[#1a1a1a] shadow-xl border-l border-white/10 min-w-[180px] opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                                            {cat.children.map(sub => (
                                                                <Link
                                                                    key={sub.id}
                                                                    href={`/categorias/${cat.slug}/${sub.slug}`}
                                                                    className="block px-4 py-2 hover:bg-[#2a2a2a] text-sm hover:text-[#D4A373]"
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link key={link.href} href={link.href} className={`hover:text-[#D4A373] transition-colors ${pathname === link.href ? 'text-[#D4A373]' : ''}`}>
                                {link.label}
                            </Link>
                        );
                    })}

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
                    {navLinks.map(link => {
                        if (link.hasDropdown && navbarCategories.length > 0) {
                            return (
                                <div key={link.href}>
                                    <div className="text-left py-2 hover:text-[#D4A373] font-semibold">{link.label}</div>
                                    <div className="pl-4 border-l border-white/10 ml-2 flex flex-col gap-2">
                                        <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="text-sm text-stone-300 hover:text-[#D4A373]">Ver Todo</Link>
                                        {navbarCategories.map(cat => (
                                            <div key={cat.id}>
                                                <Link href={`/categorias/${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="text-sm text-stone-300 hover:text-[#D4A373] block py-1">
                                                    {cat.name}
                                                </Link>
                                                {cat.children && cat.children.map(sub => (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/categorias/${cat.slug}/${sub.slug}`}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="text-xs text-stone-400 hover:text-[#D4A373] block py-1 pl-3"
                                                    >
                                                        ↳ {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-left py-2 hover:text-[#D4A373]">
                                {link.label}
                            </Link>
                        );
                    })}
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