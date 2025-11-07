'use client';

import { BlogFilters as FilterTypes } from '@/types/api';
import { useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import { FaFilter, FaTimes } from 'react-icons/fa';

interface BlogFiltersProps {
  filters: FilterTypes;
  onFiltersChange: (filters: Partial<FilterTypes>) => void;
  onClearFilters?: () => void;
}

export default function BlogFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: BlogFiltersProps) {
  const { categories, loading: categoriesLoading } = useBlogCategories();
  const { tags, loading: tagsLoading } = useBlogTags();

  const handleFilterChange = (key: keyof FilterTypes, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFiltersChange({
        category: undefined,
        tag: undefined,
        search: undefined,
        published: undefined,
      });
    }
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ''
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          Filtros de Blog
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Buscar en artículos..."
            value={filters.search || ''}
            onChange={(e) =>
              handleFilterChange('search', e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              handleFilterChange('category', e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={categoriesLoading}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Etiqueta
          </label>
          <select
            value={filters.tag || ''}
            onChange={(e) =>
              handleFilterChange('tag', e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={tagsLoading}
          >
            <option value="">Todas las etiquetas</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.slug}>
                #{tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Published Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.published?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange(
                'published',
                value === '' ? undefined : value === 'true'
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="true">Publicados</option>
            <option value="false">Borradores</option>
          </select>
        </div>
      </div>
    </div>
  );
}