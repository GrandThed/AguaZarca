'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { PROPERTY_TYPES, COMMERCIAL_STATUS } from '@/types/property';

const HeroSection: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [commercialStatus, setCommercialStatus] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchQuery) params.append('q', searchQuery);
    if (propertyType) params.append('type', propertyType);
    if (commercialStatus) params.append('status', commercialStatus);

    router.push(`/propiedades${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Encuentra tu Propiedad Ideal
          </h1>
          <p className="text-xl mb-10">
            Las mejores propiedades en venta y alquiler en Argentina
          </p>

          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Buscar por ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-3 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500"
              />

              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="px-4 py-3 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">Tipo de propiedad</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={commercialStatus}
                onChange={(e) => setCommercialStatus(e.target.value)}
                className="px-4 py-3 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">Operación</option>
                {COMMERCIAL_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaSearch className="mr-2" />
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;