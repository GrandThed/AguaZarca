'use client';

import { useState, useEffect } from 'react';
import { getPropertyStatistics } from '@/lib/api-client';
import { useInquiryStatistics } from '@/hooks/useInquiries';
import InquiryStats from '@/components/inquiries/InquiryStats';
import MLStatus from '@/components/mercadolibre/MLStatus';
import { PropertyStatistics } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  FaHome,
  FaBlog,
  FaEnvelope,
  FaEye,
  FaChartLine,
  FaArrowUp,
  FaSignOutAlt,
} from 'react-icons/fa';
import Link from 'next/link';

export default function AdminDashboard() {
  const [propertyStats, setPropertyStats] = useState<PropertyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const { statistics: inquiryStats } = useInquiryStatistics();
  const { logout } = useAuth();

  useEffect(() => {
    fetchPropertyStats();
  }, []);

  const fetchPropertyStats = async () => {
    try {
      setLoading(true);
      const stats = await getPropertyStatistics();
      setPropertyStats(stats);
    } catch (error) {
      console.error('Error fetching property stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Nueva Propiedad',
      href: '/admin/propiedades/crear',
      icon: FaHome,
      color: 'bg-blue-500',
    },
    {
      title: 'Nuevo Artículo',
      href: '/admin/blog/crear',
      icon: FaBlog,
      color: 'bg-green-500',
    },
    {
      title: 'Ver Propiedades',
      href: '/admin/propiedades',
      icon: FaChartLine,
      color: 'bg-purple-500',
    },
    {
      title: 'MercadoLibre',
      href: '/admin/mercadolibre',
      icon: FaArrowUp,
      color: 'bg-orange-500',
    },
  ];

  const managementLinks = [
    {
      title: 'Gestionar Propiedades',
      href: '/admin/propiedades',
      description: 'Ver y editar todas las propiedades',
      count: propertyStats?.totalProperties,
      urgent: false,
    },
    {
      title: 'Gestionar Blog',
      href: '/admin/blog',
      description: 'Administrar artículos y contenido',
      count: undefined, // Would need blog stats
      urgent: false,
    },
    {
      title: 'MercadoLibre',
      href: '/admin/mercadolibre',
      description: 'Conectar y sincronizar con MercadoLibre',
      count: undefined,
      urgent: false,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-blue-100">
              Bienvenido al panel de control de AguaZarca
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {propertyStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {propertyStats.totalProperties}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <FaHome className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publicadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {propertyStats.publishedProperties}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <FaEye className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Destacadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {propertyStats.featuredProperties}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500">
                <FaArrowUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {propertyStats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-500">
                <FaChartLine className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-full ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Management Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managementLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{link.title}</h3>
                {link.count !== undefined && (
                  <span
                    className={`px-2 py-1 text-sm font-medium rounded-full ${
                      link.urgent
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {link.count}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout for Stats and ML */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inquiry Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas de Consultas</h2>
          <InquiryStats />
        </div>

        {/* MercadoLibre Status */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de MercadoLibre</h2>
          <MLStatus />
        </div>
      </div>

      {/* Property Types Breakdown */}
      {propertyStats && Object.keys(propertyStats.byType).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Propiedades por Tipo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(propertyStats.byType).map(([type, count]) => (
              <div key={type} className="text-center p-4 border border-gray-200 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actividad Reciente
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              ¡Panel de administración configurado correctamente!
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {new Date().toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}