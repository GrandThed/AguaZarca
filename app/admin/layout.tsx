'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  LayoutDashboard,
  Home,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  List,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/propiedades', icon: Home, label: 'Propiedades' },
    { href: '/admin/propiedades/crear', icon: Plus, label: 'Nueva Propiedad' },
    { href: '/admin/mercadolibre', icon: ShoppingCart, label: 'MercadoLibre' },
    { href: '/admin/blog', icon: FileText, label: 'Blog' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg min-h-screen">
            <div className="p-6 border-b">
              <Link href="/admin" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">AguaZarca</span>
                <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">Admin</span>
              </Link>
              {user && (
                <p className="text-sm text-gray-600 mt-2">{user.displayName || user.email}</p>
              )}
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 pt-8 border-t">
                <button
                  onClick={logout}
                  className="flex items-center space-x-3 px-4 py-2.5 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;