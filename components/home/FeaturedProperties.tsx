'use client';

import React from 'react';
import Link from 'next/link';
import PropertyCard from '@/components/properties/PropertyCard';
import { useFeaturedProperties } from '@/hooks/useProperties';

const FeaturedProperties: React.FC = () => {
  const { properties, loading, error } = useFeaturedProperties();

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Propiedades Destacadas</h2>
            <p className="text-gray-600">Descubre nuestras mejores oportunidades</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      </section>
    );
  }

  if (error || properties.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Propiedades Destacadas</h2>
          <p className="text-gray-600">Descubre nuestras mejores oportunidades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} featured={true} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/propiedades?featured=true"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver Todas las Propiedades Destacadas
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;