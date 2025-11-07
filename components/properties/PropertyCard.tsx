'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import { Property } from '@/types/property';
import { PropertyWithRelations } from '@/types/api';
import { formatPrice, formatArea, getPropertyTypeLabel, getCommercialStatusLabel } from '@/lib/utils';
import { FaBed, FaBath, FaCar, FaRulerCombined } from 'react-icons/fa';
import { Heart } from 'lucide-react';

interface PropertyCardProps {
  property: Property | PropertyWithRelations;
  featured?: boolean;
  viewMode?: 'grid' | 'list';
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, featured = false, viewMode = 'grid' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const mainImage = property.images?.[0]?.url || '/placeholder.svg';
  const location = [
    property.neighborhood,
    property.city
  ].filter(Boolean).join(', ');

  // Helper function to get characteristic value
  const getCharacteristic = (name: string): number | undefined => {
    if ('characteristics' in property) {
      const char = property.characteristics?.find(c => c.name === name);
      return char ? Number(char.value) : undefined;
    }
    return (property as any)[name];
  };

  const bedrooms = getCharacteristic('bedrooms');
  const bathrooms = getCharacteristic('bathrooms');
  const garages = getCharacteristic('garages');
  const coveredArea = getCharacteristic('coveredArea');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement localStorage persistence
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/propiedades/${property.id}`}>
        <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer ${featured ? 'border-2 border-blue-500' : ''} flex`}>
          <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden rounded-l-lg">
            <SafeImage
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            {property.featured && (
              <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                DESTACADO
              </span>
            )}
            {property.rentalFeatured && property.comercialStatus !== 'Venta' && (
              <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                DESTACADO ALQUILER
              </span>
            )}
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{property.title}</h3>
                  <p className="text-sm text-gray-600">{getPropertyTypeLabel(property.type)}</p>
                  {location && <p className="text-sm text-gray-500">{location}</p>}
                </div>
                <button
                  onClick={handleFavoriteClick}
                  className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Agregar a favoritos"
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </button>
              </div>

              {property.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{property.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                {bedrooms && (
                  <div className="flex items-center">
                    <FaBed className="mr-1" />
                    <span>{bedrooms}</span>
                  </div>
                )}
                {bathrooms && (
                  <div className="flex items-center">
                    <FaBath className="mr-1" />
                    <span>{bathrooms}</span>
                  </div>
                )}
                {garages && (
                  <div className="flex items-center">
                    <FaCar className="mr-1" />
                    <span>{garages}</span>
                  </div>
                )}
                {coveredArea && (
                  <div className="flex items-center">
                    <FaRulerCombined className="mr-1" />
                    <span>{formatArea(coveredArea)}</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {getCommercialStatusLabel(property.comercialStatus)}
                </span>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(property.priceValue || 0, property.priceCurrency)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/propiedades/${property.id}`}>
      <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer ${featured ? 'border-2 border-blue-500' : ''}`}>
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <SafeImage
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          {property.featured && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              DESTACADO
            </span>
          )}
          {property.rentalFeatured && property.comercialStatus !== 'Venta' && (
            <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              DESTACADO ALQUILER
            </span>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded">
            <span className="text-sm font-semibold">
              {getCommercialStatusLabel(property.comercialStatus)}
            </span>
          </div>
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="Agregar a favoritos"
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{property.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{getPropertyTypeLabel(property.type)}</p>
          {location && <p className="text-sm text-gray-500 mb-3">{location}</p>}

          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(property.priceValue || 0, property.priceCurrency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600 text-sm">
            {bedrooms && (
              <div className="flex items-center">
                <FaBed className="mr-1" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center">
                <FaBath className="mr-1" />
                <span>{bathrooms}</span>
              </div>
            )}
            {garages && (
              <div className="flex items-center">
                <FaCar className="mr-1" />
                <span>{garages}</span>
              </div>
            )}
            {coveredArea && (
              <div className="flex items-center">
                <FaRulerCombined className="mr-1" />
                <span>{formatArea(coveredArea)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;