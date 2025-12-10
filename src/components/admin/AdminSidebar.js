'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Home, Tag, FileText, Settings, Image } from 'lucide-react';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/orders', label: 'Órdenes', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/discounts', label: 'Descuentos', icon: Tag },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/content', label: 'Editar Home', icon: Home },
  { href: '/admin/promociones', label: 'Promociones', icon: FileText },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
  { href: '/admin/settings/payments', label: 'Pagos', icon: FileText },
  { href: '/admin/images', label: 'Imágenes', icon: Image },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-stone-900 text-white flex flex-col">
      <div className="p-6 text-center border-b border-stone-800">
        <h2 className="text-2xl font-serif font-bold">MATETÉ</h2>
        <span className="text-sm text-stone-400">Admin Panel</span>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === link.href
                ? 'bg-stone-700 text-white'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}>
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-stone-800">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-white">
          <Home size={20} /><span>Volver al Sitio</span>
        </Link>
      </div>
    </aside>
  );
}