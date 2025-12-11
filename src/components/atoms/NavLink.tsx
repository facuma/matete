'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    activeClassName?: string;
    onClick?: () => void;
}

export const NavLink = ({ href, children, className, activeClassName = 'text-[#D4A373]', onClick }: NavLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "transition-colors hover:text-[#D4A373]",
                isActive ? activeClassName : 'text-inherit',
                className
            )}
        >
            {children}
        </Link>
    );
};
