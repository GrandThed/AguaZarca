'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Property } from '@/types/property';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';
import PropertySearch from './PropertySearch';
import Pagination from '../ui/Pagination';
import { PropertyGridSkeleton, EmptyState } from '../ui/LoadingSkeletons';
import { Grid3X3Icon, ListIcon } from 'lucide-react';

interface PropertyListingContentProps {
  initialProperties: Property[];
  searchParams: { [key: string]: string | string[] | undefined };
}

const PROPERTIES_PER_PAGE = 12;

export default function PropertyListingContent({
  initialProperties,
  searchParams,
}: PropertyListingContentProps) {
  const [properties] = useState<Property[]>(initialProperties || []);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.q as string || '');
  const [propertyType, setPropertyType] = useState(searchParams.type as string || '');
  const [commercialStatus, setCommercialStatus] = useState(searchParams.status as string || '');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [bedrooms, setBedrooms] = useState<number | undefined>();
  const [bathrooms, setBathrooms] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>('newest');

  // Parse URL params on mount
  useEffect(() => {
    if (searchParams.minPrice) setMinPrice(Number(searchParams.minPrice));
    if (searchParams.maxPrice) setMaxPrice(Number(searchParams.maxPrice));
    if (searchParams.bedrooms) setBedrooms(Number(searchParams.bedrooms));
    if (searchParams.bathrooms) setBathrooms(Number(searchParams.bathrooms));
    if (searchParams.sort) setSortBy(searchParams.sort as string);
    if (searchParams.page) setCurrentPage(Number(searchParams.page));
  }, [searchParams]);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    console.log('properties', properties);
    let filtered = [...(properties || [])];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.address?.toLowerCase().includes(query) ||
          p.neighborhood?.toLowerCase().includes(query) ||
          p.city?.toLowerCase().includes(query)
      );
    }

    // Property type filter
    if (propertyType) {
      filtered = filtered.filter((p) => p.type === propertyType);
    }

    // Commercial status filter
    if (commercialStatus) {
      filtered = filtered.filter((p) => p.comercialStatus === commercialStatus);
    }

    // Price range filter
    if (minPrice !== undefined) {
      filtered = filtered.filter((p) => (p.priceValue || 0) >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((p) => (p.priceValue || 0) <= maxPrice);
    }

    // Bedrooms filter
    if (bedrooms !== undefined) {
      filtered = filtered.filter((p) => (p.bedrooms || 0) >= bedrooms);
    }

    // Bathrooms filter
    if (bathrooms !== undefined) {
      filtered = filtered.filter((p) => (p.bathrooms || 0) >= bathrooms);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.priceValue || 0) - (b.priceValue || 0);
        case 'price-desc':
          return (b.priceValue || 0) - (a.priceValue || 0);
        case 'area-asc':
          return (a.coveredArea || 0) - (b.coveredArea || 0);
        case 'area-desc':
          return (b.coveredArea || 0) - (a.coveredArea || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return filtered;
  }, [properties, searchQuery, propertyType, commercialStatus, minPrice, maxPrice, bedrooms, bathrooms, sortBy]);

  // Pagination
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + PROPERTIES_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, propertyType, commercialStatus, minPrice, maxPrice, bedrooms, bathrooms, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setPropertyType('');
    setCommercialStatus('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setBedrooms(undefined);
    setBathrooms(undefined);
    setSortBy('newest');
    setCurrentPage(1);
  };

  if (loading) {
    return <PropertyGridSkeleton count={PROPERTIES_PER_PAGE} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Propiedades Disponibles
          </h1>
          <p className="text-gray-600">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4">
            <PropertyFilters
              searchQuery={searchQuery}
              propertyType={propertyType}
              commercialStatus={commercialStatus}
              minPrice={minPrice}
              maxPrice={maxPrice}
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              sortBy={sortBy}
              onSearchQueryChange={setSearchQuery}
              onPropertyTypeChange={setPropertyType}
              onCommercialStatusChange={setCommercialStatus}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              onBedroomsChange={setBedrooms}
              onBathroomsChange={setBathrooms}
              onSortByChange={setSortBy}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* View Mode Toggle & Sort */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Vista de cuadrícula"
                >
                  <Grid3X3Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Vista de lista"
                >
                  <ListIcon className="h-5 w-5" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Más recientes</option>
                <option value="price-asc">Precio: Menor a mayor</option>
                <option value="price-desc">Precio: Mayor a menor</option>
                <option value="area-asc">Área: Menor a mayor</option>
                <option value="area-desc">Área: Mayor a menor</option>
              </select>
            </div>

            {/* Properties Grid/List */}
            {paginatedProperties.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {paginatedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No se encontraron propiedades"
                description="Intenta ajustar los filtros para ver más resultados"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}