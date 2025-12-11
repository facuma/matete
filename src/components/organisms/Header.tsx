'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useCategories } from '@/contexts/category-context';
import { cn } from '@/lib/utils';
import { Logo } from '../atoms/Logo';
import { NavLink } from '../atoms/NavLink';
import { CartWidget } from '../molecules/CartWidget';
import { UserMenu } from '../molecules/UserMenu';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const pathname = usePathname();
    const { categories } = useCategories();
    // Assuming categories always adhere to strict shape or default to empty
    const navbarCategories = categories?.filter((c: any) => c.showInNavbar) || [];

    const navLinks = [
        { href: '/', label: 'Inicio' },
        { href: '/shop', label: 'Productos', hasDropdown: true },
        { href: '/blog', label: 'Blog' },
    ];

    const isHome = pathname === '/';

    return (
        <header
            className={cn(
                "fixed w-full z-50 transition-all duration-300 text-white",
                isHome ? 'bg-[#1a1a1a]/90 backdrop-blur-md' : 'bg-[#1a1a1a]'
            )}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Mobile Menu Button | Left */}
                <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu />
                </button>

                {/* Logo | Center/Left */}
                <Logo />

                {/* Desktop Nav | Center */}
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
                                    <NavLink href={link.href} className={cn(pathname === link.href ? 'text-[#D4A373]' : '')}>
                                        {link.label}
                                    </NavLink>

                                    {/* Dropdown Menu */}
                                    <div className="absolute top-20 left-0 bg-[#1a1a1a] shadow-xl border-t-2 border-[#D4A373] min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                        <div className="py-2">
                                            <NavLink
                                                href="/shop"
                                                className="block px-4 py-2 hover:bg-[#2a2a2a] text-sm text-[#D4A373] font-semibold border-b border-white/10"
                                            >
                                                Ver Todo
                                            </NavLink>
                                            {navbarCategories.map((cat: any) => (
                                                <div key={cat.id} className="relative group/sub">
                                                    <NavLink
                                                        href={`/categorias/${cat.slug}`}
                                                        className="block px-4 py-2 hover:bg-[#2a2a2a] text-sm hover:text-[#D4A373] flex justify-between items-center"
                                                    >
                                                        {cat.name}
                                                        {cat.children && cat.children.length > 0 && <span className="text-xs">›</span>}
                                                    </NavLink>
                                                    {/* Submenu Level 2 */}
                                                    {cat.children && cat.children.length > 0 && (
                                                        <div className="absolute left-full top-0 bg-[#1a1a1a] shadow-xl border-l border-white/10 min-w-[180px] opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                                            {cat.children.map((sub: any) => (
                                                                <NavLink
                                                                    key={sub.id}
                                                                    href={`/categorias/${cat.slug}/${sub.slug}`}
                                                                    className="block px-4 py-2 hover:bg-[#2a2a2a] text-sm hover:text-[#D4A373]"
                                                                >
                                                                    {sub.name}
                                                                </NavLink>
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
                            <NavLink key={link.href} href={link.href} className={cn(pathname === link.href ? 'text-[#D4A373]' : '')}>
                                {link.label}
                            </NavLink>
                        );
                    })}

                    {/* User Menu | Right Desktop */}
                    <UserMenu />
                </nav>

                {/* Cart Widget | Right */}
                <CartWidget />
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#1a1a1a] border-t border-stone-800 p-4 absolute w-full flex flex-col gap-4 shadow-xl">
                    {navLinks.map(link => {
                        if (link.hasDropdown && navbarCategories.length > 0) {
                            return (
                                <div key={link.href}>
                                    <div className="text-left py-2 hover:text-[#D4A373] font-semibold">{link.label}</div>
                                    <div className="pl-4 border-l border-white/10 ml-2 flex flex-col gap-2">
                                        <NavLink href="/shop" onClick={() => setIsMenuOpen(false)} className="text-sm text-stone-300 hover:text-[#D4A373]">Ver Todo</NavLink>
                                        {navbarCategories.map((cat: any) => (
                                            <div key={cat.id}>
                                                <NavLink
                                                    href={`/categorias/${cat.slug}`}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="text-sm text-stone-300 hover:text-[#D4A373] block py-1"
                                                >
                                                    {cat.name}
                                                </NavLink>
                                                {cat.children && cat.children.map((sub: any) => (
                                                    <NavLink
                                                        key={sub.id}
                                                        href={`/categorias/${cat.slug}/${sub.slug}`}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="text-xs text-stone-400 hover:text-[#D4A373] block py-1 pl-3"
                                                    >
                                                        ↳ {sub.name}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <NavLink key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-left py-2 hover:text-[#D4A373]">
                                {link.label}
                            </NavLink>
                        );
                    })}

                    <UserMenu onMobile closeMenu={() => setIsMenuOpen(false)} />
                </div>
            )}
        </header>
    );
};
