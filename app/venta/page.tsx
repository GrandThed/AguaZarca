'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProperties } from '@/hooks/useProperties';
import PropertySearch from '@/components/search/PropertySearch';
import PropertyFilters from '@/components/search/PropertyFilters';
import PropertyCard from '@/components/properties/PropertyCard';
import Pagination from '@/components/ui/Pagination';
import { FaSearch } from 'react-icons/fa';

export default function VentaPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const initialFilters = {
    search: searchParams.get('q') || undefined,
    type: searchParams.get('type') || undefined,
    comercialStatus: 'Venta', // Fixed to sale properties
    city: searchParams.get('city') || undefined,
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
  };

  const {
    properties,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    refetch,
  } = useProperties(initialFilters);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilters({ search: query });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Propiedades en Venta
          </h1>
          <p className="text-gray-600 mb-4">
            Encuentra las mejores propiedades en venta. Casas, departamentos, terrenos y más.
          </p>
          {searchQuery && (
            <p className="text-gray-600">
              Resultados para: <span className="font-semibold">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <PropertySearch
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Buscar propiedades en venta..."
            />

            {/* Filters */}
            <PropertyFilters
              filters={filters}
              onFiltersChange={updateFilters}
              hideCommercialStatus={true} // Hide since it's fixed to "Venta"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Buscando...' : `${pagination.total} Propiedades en Venta`}
                </h2>
                {pagination.total > 0 && (
                  <p className="text-sm text-gray-600">
                    Página {pagination.page} de {pagination.totalPages}
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && properties.length === 0 && (
              <div className="text-center py-12">
                <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron propiedades en venta
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar tus filtros de búsqueda
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    updateFilters({
                      search: undefined,
                      type: undefined,
                      city: undefined,
                      priceMin: undefined,
                      priceMax: undefined,
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Results Grid */}
            {!loading && properties.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                    showingFrom={(pagination.page - 1) * pagination.limit + 1}
                    showingTo={Math.min(pagination.page * pagination.limit, pagination.total)}
                    totalItems={pagination.total}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}