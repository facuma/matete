'use client';

import { User, LogOut, Settings } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { NavLink } from '../atoms/NavLink';

interface UserMenuProps {
    onMobile?: boolean;
    closeMenu?: () => void;
}

export const UserMenu = ({ onMobile = false, closeMenu }: UserMenuProps) => {
    const { data: session } = useSession();

    if (!session?.user) {
        return (
            <NavLink href="/login" onClick={closeMenu} className="flex items-center gap-1">
                <User size={18} />
                <span>Iniciar Sesión</span>
            </NavLink>
        );
    }

    const isAdmin = (session.user as any).role === 'admin';

    // Desktop View
    if (!onMobile) {
        return (
            <div className="flex items-center gap-6">
                {isAdmin ? (
                    <NavLink href="/admin" className="flex items-center gap-1">
                        <Settings size={18} />
                        <span>Administrar</span>
                    </NavLink>
                ) : (
                    <NavLink href="/my-orders" className="flex items-center gap-1">
                        <User size={18} />
                        <span>Mis Pedidos</span>
                    </NavLink>
                )}
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="hover:text-[#D4A373] transition-colors flex items-center gap-1"
                >
                    <LogOut size={18} />
                    <span>Salir</span>
                </button>
            </div>
        );
    }

    // Mobile View
    return (
        <div className="flex flex-col gap-2">
            {isAdmin ? (
                <NavLink href="/admin" onClick={closeMenu} className="flex items-center gap-2 py-2">
                    <Settings size={18} /> Administrar Tienda
                </NavLink>
            ) : (
                <NavLink href="/my-orders" onClick={closeMenu} className="flex items-center gap-2 py-2">
                    <User size={18} /> Mis Pedidos
                </NavLink>
            )}
            <button onClick={() => {
                signOut({ callbackUrl: '/' });
                closeMenu?.();
            }} className="text-left py-2 hover:text-[#D4A373] flex items-center gap-2">
                <LogOut size={18} /> Salir
            </button>
        </div>
    );
};
