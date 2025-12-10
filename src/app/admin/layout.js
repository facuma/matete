'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';
  const isPreviewPage = pathname?.startsWith('/admin/preview');

  // Don't show sidebar on login or preview page
  if (isLoginPage || isPreviewPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-800">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 z-30 flex items-center px-4 justify-between">
        <div className="font-serif font-bold text-lg">MATETÉ Admin</div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-stone-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 p-4 md:p-10 pt-20 md:pt-10 overflow-x-hidden w-full">
        {children}
      </main>
    </div>
  );
}
