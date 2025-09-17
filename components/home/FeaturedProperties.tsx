import React from 'react';
import Link from 'next/link';
import PropertyCard from '@/components/properties/PropertyCard';
import { Property } from '@/types/property';

async function getFeaturedProperties(): Promise<Property[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties?featured=true&limit=6`);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.properties || [];
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
}

const FeaturedProperties: React.FC = async () => {
  const properties = await getFeaturedProperties();

  if (properties.length === 0) {
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
          {properties.map((property) => (
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