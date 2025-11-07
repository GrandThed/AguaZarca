'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import PropertyDetailContent from '@/components/properties/PropertyDetailContent';
import { PropertyWithRelations } from '@/types/api';
import { getProperty, getProperties } from '@/lib/api-client';

export default function PropertyDetailPage() {
  const params = useParams();
  const [property, setProperty] = useState<PropertyWithRelations | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<PropertyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        const id = params.id as string;

        // Get the main property
        const propertyData = await getProperty(Number(id));
        if (!propertyData) {
          notFound();
          return;
        }

        setProperty(propertyData);

        // Get related properties of the same type
        try {
          const relatedData = await getProperties({
            type: propertyData.type,
            limit: 4,
          });

          // Filter out the current property
          const filtered = relatedData.data.filter(p => p.id !== propertyData.id);
          setRelatedProperties(filtered.slice(0, 4));
        } catch (relatedError) {
          console.error('Error fetching related properties:', relatedError);
          setRelatedProperties([]);
        }
      } catch (err: any) {
        console.error('Error loading property:', err);
        setError(err.message || 'Error loading property');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadProperty();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: property.title,
            description: property.description,
            price: {
              '@type': 'MonetaryAmount',
              currency: property.priceCurrency || 'ARS',
              value: property.priceValue,
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: property.addressLine,
              addressLocality: property.city,
              addressRegion: property.state,
              addressCountry: property.country || 'Argentina',
            },
            image: property.images?.map((img) => img.url) || [],
          }),
        }}
      />
      <PropertyDetailContent property={property} relatedProperties={relatedProperties} />
    </>
  );
}