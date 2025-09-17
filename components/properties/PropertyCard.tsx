import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types/property';
import { formatPrice, formatArea, getPropertyTypeLabel, getCommercialStatusLabel } from '@/lib/utils';
import { FaBed, FaBath, FaCar, FaRulerCombined } from 'react-icons/fa';

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, featured = false }) => {
  const mainImage = property.images?.[0]?.url || '/placeholder.svg';
  const location = [property.neighborhood, property.city].filter(Boolean).join(', ');

  return (
    <Link href={`/propiedades/${property.id}`}>
      <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer ${featured ? 'border-2 border-blue-500' : ''}`}>
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
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
          {property.rentalFeatured && property.commercialStatus !== 'sale' && (
            <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              DESTACADO ALQUILER
            </span>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded">
            <span className="text-sm font-semibold">
              {getCommercialStatusLabel(property.commercialStatus)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{property.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{getPropertyTypeLabel(property.type)}</p>
          {location && <p className="text-sm text-gray-500 mb-3">{location}</p>}

          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600 text-sm">
            {property.bedrooms && (
              <div className="flex items-center">
                <FaBed className="mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <FaBath className="mr-1" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.garages && (
              <div className="flex items-center">
                <FaCar className="mr-1" />
                <span>{property.garages}</span>
              </div>
            )}
            {property.coveredArea && (
              <div className="flex items-center">
                <FaRulerCombined className="mr-1" />
                <span>{formatArea(property.coveredArea)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;