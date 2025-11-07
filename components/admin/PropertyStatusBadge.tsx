'use client';

import { PropertyWithRelations } from '@/types/api';

interface PropertyStatusBadgeProps {
  property: PropertyWithRelations;
}

export default function PropertyStatusBadge({ property }: PropertyStatusBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {property.published && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Publicado
        </span>
      )}

      {!property.published && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Borrador
        </span>
      )}

      {property.featured && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Destacado
        </span>
      )}

      {property.slider && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Slider
        </span>
      )}

      {property.rentalFeatured && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Alquiler Destacado
        </span>
      )}

      {property.mlId && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          MercadoLibre
        </span>
      )}

      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        {property.comercialStatus}
      </span>

      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        {property.type}
      </span>

      {property.views > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
          {property.views} vistas
        </span>
      )}
    </div>
  );
}