'use client';

import { useState } from 'react';
import { useAdminProperties } from '@/hooks/useAdminProperties';
import PropertyActions from '@/components/admin/PropertyActions';
import PropertyStatusBadge from '@/components/admin/PropertyStatusBadge';
import PropertyFilters from '@/components/search/PropertyFilters';
import Pagination from '@/components/ui/Pagination';
import BulkActionsDropdown from '@/components/admin/BulkActionsDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlus, FaEye, FaDownload } from 'react-icons/fa';
import { exportInquiries } from '@/lib/api-client';
import { toast } from 'react-toastify';

export default function AdminPropertiesPage() {
  const {
    properties,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    refetch,
  } = useAdminProperties(); // Show all properties (published and unpublished) in admin

  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const handleSelectProperty = (propertyId: number) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleExport = async () => {
    try {
      // Create CSV export of properties
      const headers = ['ID', 'Título', 'Tipo', 'Estado Comercial', 'Precio', 'Moneda', 'Ciudad', 'Publicado', 'Destacado', 'Fecha Creación'];
      const rows = properties.map(p => [
        p.id,
        p.title,
        p.type,
        p.comercialStatus,
        p.priceValue || '',
        p.priceCurrency,
        p.city,
        p.published ? 'Sí' : 'No',
        p.featured ? 'Sí' : 'No',
        new Date(p.createdAt).toLocaleDateString('es-ES')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `propiedades_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Exportación completada');
    } catch (error: any) {
      toast.error(error.message || 'Error al exportar');
    }
  };

  if (loading && properties.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestionar Propiedades</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestionar Propiedades</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} {pagination.total === 1 ? 'propiedad' : 'propiedades'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <FaDownload />
            Exportar
          </button>
          <Link
            href="/admin/propiedades/crear"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
            Nueva Propiedad
          </Link>
        </div>
      </div>

      {/* Filters */}
      <PropertyFilters
        filters={filters}
        onFiltersChange={updateFilters}
      />

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedProperties.length} propiedad(es) seleccionada(s)
            </span>
            <div className="flex gap-2">
              <BulkActionsDropdown
                selectedIds={selectedProperties}
                onActionComplete={refetch}
                onClearSelection={() => setSelectedProperties([])}
              />
            </div>
          </div>
        </div>
      )}

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No se encontraron propiedades</p>
          <Link
            href="/admin/propiedades/crear"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
            Crear primera propiedad
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProperties.length === properties.length && properties.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProperties.includes(property.id)}
                        onChange={() => handleSelectProperty(property.id)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="relative h-16 w-24 flex-shrink-0 mr-4">
                          {property.images.length > 0 ? (
                            <Image
                              src={property.images[0].thumbnailUrl || property.images[0].url}
                              alt={property.title}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="h-16 w-24 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {property.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {property.type} - {property.city}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {property.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PropertyStatusBadge property={property} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {property.priceValue ? (
                        <div className="text-sm text-gray-900">
                          {property.priceCurrency} {property.priceValue.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin precio</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(property.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/propiedades/${property.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-500"
                          title="Ver propiedad"
                        >
                          <FaEye />
                        </Link>
                        <PropertyActions
                          property={property}
                          onUpdate={refetch}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                showingFrom={(pagination.page - 1) * pagination.limit + 1}
                showingTo={Math.min(pagination.page * pagination.limit, pagination.total)}
                totalItems={pagination.total}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}