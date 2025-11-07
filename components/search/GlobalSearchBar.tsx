'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/property';

interface GlobalSearchBarProps {
  properties?: Property[];
  className?: string;
}

export default function GlobalSearchBar({ properties = [], className = '' }: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions based on query
  useEffect(() => {
    if (query.length > 2 && properties.length > 0) {
      const searchTerm = query.toLowerCase();
      const filtered = properties.filter(property =>
        property.title?.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm) ||
        property.address?.toLowerCase().includes(searchTerm) ||
        property.neighborhood?.toLowerCase().includes(searchTerm) ||
        property.city?.toLowerCase().includes(searchTerm) ||
        property.type?.toLowerCase().includes(searchTerm)
      ).slice(0, 5); // Limit to 5 suggestions

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [query]); // Remove properties dependency to prevent infinite loop

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (property: Property) => {
    setShowSuggestions(false);
    setQuery('');
    router.push(`/propiedades/${property.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const formatPrice = (price?: number | null) => {
    if (!price) return 'Consultar';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Buscar por ubicación, tipo o características..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {suggestions.map((property, index) => (
              <button
                key={property.id}
                onClick={() => handleSuggestionClick(property)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                  selectedIndex === index ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-2">
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {property.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {property.neighborhood && `${property.neighborhood}, `}
                      {property.city}
                    </p>
                    {property.type && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {property.type}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(property.priceValue || 0)}
                    </p>
                    {property.comercialStatus && (
                      <p className="text-xs text-gray-500 capitalize">
                        {property.comercialStatus}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos los resultados →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}