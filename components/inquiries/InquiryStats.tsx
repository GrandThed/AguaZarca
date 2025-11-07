'use client';

import { useInquiryStatistics } from '@/hooks/useInquiries';
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

export default function InquiryStats() {
  const { statistics, loading, error } = useInquiryStatistics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error al cargar las estadísticas</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Consultas',
      value: statistics.total,
      icon: FaEnvelope,
      color: 'bg-blue-500',
    },
    {
      title: 'Sin Leer',
      value: statistics.unread,
      icon: FaEnvelopeOpen,
      color: 'bg-red-500',
    },
    {
      title: 'Hoy',
      value: statistics.today,
      icon: FaCalendarDay,
      color: 'bg-green-500',
      growth: statistics.growth.daily,
    },
    {
      title: 'Esta Semana',
      value: statistics.week,
      icon: FaCalendarWeek,
      color: 'bg-purple-500',
      growth: statistics.growth.weekly,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value.toLocaleString()}
                </p>
                {card.growth !== undefined && (
                  <div className="flex items-center mt-2">
                    {card.growth >= 0 ? (
                      <FaArrowUp className="text-green-500 text-sm mr-1" />
                    ) : (
                      <FaArrowDown className="text-red-500 text-sm mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        card.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {Math.abs(card.growth)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs anterior</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Read Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tasa de Lectura
        </h3>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${statistics.readRate}%` }}
              ></div>
            </div>
          </div>
          <span className="ml-4 text-lg font-semibold text-gray-900">
            {statistics.readRate}%
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {statistics.total - statistics.unread} de {statistics.total} consultas leídas
        </p>
      </div>

      {/* Top Properties */}
      {statistics.topProperties.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Propiedades con Más Consultas
          </h3>
          <div className="space-y-3">
            {statistics.topProperties.slice(0, 5).map((property, index) => (
              <div key={property.propertyId} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {property.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {property.propertyId}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {property.count}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(property.count / statistics.topProperties[0].count) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.month}
              </p>
              {statistics.growth.monthly !== undefined && (
                <div className="flex items-center mt-2">
                  {statistics.growth.monthly >= 0 ? (
                    <FaArrowUp className="text-green-500 text-sm mr-1" />
                  ) : (
                    <FaArrowDown className="text-red-500 text-sm mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      statistics.growth.monthly >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(statistics.growth.monthly)}%
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-orange-500">
              <FaCalendarAlt className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            Promedio Diario
          </h4>
          <p className="text-xl font-semibold text-gray-900">
            {(statistics.month / new Date().getDate()).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">consultas por día</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            Tiempo de Respuesta
          </h4>
          <p className="text-xl font-semibold text-gray-900">
            {Number(statistics.readRate) > 80 ? 'Excelente' : Number(statistics.readRate) > 60 ? 'Bueno' : 'Mejorable'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            basado en tasa de lectura
          </p>
        </div>
      </div>
    </div>
  );
}