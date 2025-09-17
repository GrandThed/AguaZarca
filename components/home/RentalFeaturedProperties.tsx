import React from 'react';
import Link from 'next/link';
import PropertyCard from '@/components/properties/PropertyCard';
import { Property } from '@/types/property';

async function getRentalFeaturedProperties(): Promise<Property[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/properties?rentalFeatured=true&commercialStatus=annual,temporary&limit=6`
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.properties || [];
  } catch (error) {
    console.error('Error fetching rental featured properties:', error);
    return [];
  }
}

const RentalFeaturedProperties: React.FC = async () => {
  const properties = await getRentalFeaturedProperties();

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Alquileres Destacados</h2>
          <p className="text-gray-600">Las mejores opciones de alquiler disponibles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/alquiler"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Ver Todos los Alquileres
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RentalFeaturedProperties;