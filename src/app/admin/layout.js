'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const isPreviewPage = pathname?.startsWith('/admin/preview');

  // Don't show sidebar on login or preview page
  if (isLoginPage || isPreviewPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-800">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
