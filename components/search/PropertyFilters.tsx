'use client';

import { useState } from 'react';
import { PropertyFilters as FilterTypes } from '@/types/api';
import { FaFilter, FaTimes } from 'react-icons/fa';

interface PropertyFiltersProps {
  filters: FilterTypes;
  onFiltersChange: (filters: Partial<FilterTypes>) => void;
  onClearFilters?: () => void;
  hideCommercialStatus?: boolean;
}

const PROPERTY_TYPES = [
  'Casa',
  'Departamento',
  'PH',
  'Local comercial',
  'Oficina',
  'Terreno',
  'Cochera',
  'Galpón',
  'Campo',
  'Hotel',
  'Edificio',
  'Fondo de comercio',
  'Depósito',
  'Quinta',
  'Otros',
];

const COMMERCIAL_STATUS = [
  { value: 'Venta', label: 'Venta' },
  { value: 'Alquiler anual', label: 'Alquiler anual' },
  { value: 'Alquiler temporal', label: 'Alquiler temporal' },
];

const CITIES = [
  'Córdoba',
  'Carlos Paz',
  'Alta Gracia',
  'Río Cuarto',
  'Villa María',
  'San Francisco',
  'Jesús María',
  'La Falda',
  'Cosquín',
  'Villa General Belgrano',
];

export default function PropertyFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  hideCommercialStatus = false,
}: PropertyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterTypes, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFiltersChange({
        type: undefined,
        comercialStatus: undefined,
        city: undefined,
        priceMin: undefined,
        priceMax: undefined,
        bedrooms: undefined,
        bathrooms: undefined,
        featured: undefined,
      });
    }
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <FaTimes className="text-xs" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Propiedad
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Commercial Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operación
          </label>
          <select
            value={filters.comercialStatus || ''}
            onChange={(e) => handleFilterChange('comercialStatus', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las operaciones</option>
            {COMMERCIAL_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las ciudades</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rango de Precio (USD)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Mínimo"
              value={filters.priceMin || ''}
              onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Máximo"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAdvanced ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dormitorios
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Cualquier cantidad</option>
                <option value="1">1 dormitorio</option>
                <option value="2">2 dormitorios</option>
                <option value="3">3 dormitorios</option>
                <option value="4">4 dormitorios</option>
                <option value="5">5+ dormitorios</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baños
              </label>
              <select
                value={filters.bathrooms || ''}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Cualquier cantidad</option>
                <option value="1">1 baño</option>
                <option value="2">2 baños</option>
                <option value="3">3 baños</option>
                <option value="4">4+ baños</option>
              </select>
            </div>

            {/* Featured Only */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={filters.featured === true}
                onChange={(e) => handleFilterChange('featured', e.target.checked ? true : undefined)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Solo propiedades destacadas
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}