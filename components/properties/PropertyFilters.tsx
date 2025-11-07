'use client';

import React from 'react';
import { PROPERTY_TYPES, COMMERCIAL_STATUS } from '@/types/property';
import { X } from 'lucide-react';

interface PropertyFiltersProps {
  searchQuery: string;
  propertyType: string;
  commercialStatus: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy: string;
  onSearchQueryChange: (value: string) => void;
  onPropertyTypeChange: (value: string) => void;
  onCommercialStatusChange: (value: string) => void;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
  onBedroomsChange: (value: number | undefined) => void;
  onBathroomsChange: (value: number | undefined) => void;
  onSortByChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function PropertyFilters({
  searchQuery,
  propertyType,
  commercialStatus,
  minPrice,
  maxPrice,
  bedrooms,
  bathrooms,
  onSearchQueryChange,
  onPropertyTypeChange,
  onCommercialStatusChange,
  onMinPriceChange,
  onMaxPriceChange,
  onBedroomsChange,
  onBathroomsChange,
  onClearFilters,
}: PropertyFiltersProps) {
  const hasActiveFilters = searchQuery || propertyType || commercialStatus ||
    minPrice !== undefined || maxPrice !== undefined ||
    bedrooms !== undefined || bathrooms !== undefined;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Título, descripción, ubicación..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Propiedad
          </label>
          <select
            value={propertyType}
            onChange={(e) => onPropertyTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            {PROPERTY_TYPES.map((type: { value: string; label: string }) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Commercial Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operación
          </label>
          <select
            value={commercialStatus}
            onChange={(e) => onCommercialStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas</option>
            {COMMERCIAL_STATUS.map((status: { value: string; label: string }) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de Precio (ARS)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={minPrice || ''}
              onChange={(e) => onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Mín"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="self-center text-gray-500">-</span>
            <input
              type="number"
              value={maxPrice || ''}
              onChange={(e) => onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Máx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Habitaciones (mín)
          </label>
          <select
            value={bedrooms || ''}
            onChange={(e) => onBedroomsChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Cualquiera</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Baños (mín)
          </label>
          <select
            value={bathrooms || ''}
            onChange={(e) => onBathroomsChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Cualquiera</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>
    </div>
  );
}