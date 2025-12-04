'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';

export function ConditionalLayout({ children }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    // Don't show e-commerce layout for admin routes
    if (isAdminRoute) {
        return <>{children}</>;
    }

    // Show normal e-commerce layout
    return (
        <>
            <Header />
            <CartSidebar />
            <main className="flex-grow bg-[#FAF9F6]">{children}</main>
            <Footer />
        </>
    );
}
