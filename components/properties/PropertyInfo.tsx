'use client';

import React from 'react';
import { Property } from '@/types/property';
import { PropertyWithRelations } from '@/types/api';
import { Check, X } from 'lucide-react';

interface PropertyInfoProps {
  property: Property | PropertyWithRelations;
}

const characteristicsLabels: Record<string, string> = {
  bedrooms: 'Habitaciones',
  bathrooms: 'Baños',
  garages: 'Garajes',
  coveredArea: 'Área cubierta',
  totalArea: 'Área total',
  stories: 'Pisos',
  yearBuilt: 'Año de construcción',
};

const amenitiesLabels: Record<string, string> = {
  pool: 'Piscina',
  garden: 'Jardín',
  terrace: 'Terraza',
  balcony: 'Balcón',
  barbecue: 'Parrilla',
  gym: 'Gimnasio',
  sauna: 'Sauna',
  jacuzzi: 'Jacuzzi',
  playroom: 'Sala de juegos',
  laundry: 'Lavadero',
  storage: 'Bodega',
  security: 'Seguridad',
  elevator: 'Ascensor',
  parking: 'Estacionamiento',
  furnished: 'Amueblado',
  heating: 'Calefacción',
  cooling: 'Aire acondicionado',
  kitchen: 'Cocina',
  living_room: 'Living',
  dining_room: 'Comedor',
  study: 'Estudio',
  pet_friendly: 'Acepta mascotas',
  internet: 'Internet',
  cable_tv: 'TV por cable',
  alarm: 'Alarma',
  intercom: 'Portero',
  video_surveillance: 'Video vigilancia',
};

export default function PropertyInfo({ property }: PropertyInfoProps) {
  // Helper function to get characteristic value
  const getCharacteristic = (name: string): string | number | undefined => {
    if ('characteristics' in property) {
      const char = property.characteristics?.find(c => c.name === name);
      return char?.value;
    }
    return (property as any)[name];
  };

  const characteristics = Object.entries(characteristicsLabels)
    .filter(([key]) => {
      const value = getCharacteristic(key);
      return value !== undefined && value !== null && typeof value !== 'object';
    })
    .map(([key, label]) => ({
      label,
      value: getCharacteristic(key) as string | number,
    }));

  const amenities = property.attributes || [];
  const groupedAmenities = {
    comfort: ['pool', 'garden', 'terrace', 'balcony', 'barbecue', 'gym', 'sauna', 'jacuzzi', 'playroom'],
    services: ['laundry', 'storage', 'elevator', 'parking', 'furnished', 'kitchen', 'living_room', 'dining_room', 'study'],
    technology: ['heating', 'cooling', 'internet', 'cable_tv'],
    security: ['security', 'alarm', 'intercom', 'video_surveillance'],
    other: ['pet_friendly'],
  };

  const getAmenitiesByGroup = (group: string[]) => {
    return group.filter((amenity) =>
      amenities.some((attr) => attr.name === amenity && attr.value)
    );
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      {property.description && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
          <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
        </div>
      )}

      {/* Characteristics */}
      {characteristics.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Características</h2>
          <div className="grid grid-cols-2 gap-4">
            {characteristics.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{label}:</span>
                <span className="font-semibold text-gray-900">
                  {typeof value === 'number' && label.includes('Área') ? `${value} m²` : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comodidades y Servicios</h2>

          {/* Comfort */}
          {getAmenitiesByGroup(groupedAmenities.comfort).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Confort</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getAmenitiesByGroup(groupedAmenities.comfort).map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenitiesLabels[amenity]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {getAmenitiesByGroup(groupedAmenities.services).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Servicios</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getAmenitiesByGroup(groupedAmenities.services).map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenitiesLabels[amenity]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technology */}
          {getAmenitiesByGroup(groupedAmenities.technology).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tecnología</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getAmenitiesByGroup(groupedAmenities.technology).map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenitiesLabels[amenity]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {getAmenitiesByGroup(groupedAmenities.security).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Seguridad</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getAmenitiesByGroup(groupedAmenities.security).map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenitiesLabels[amenity]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other */}
          {getAmenitiesByGroup(groupedAmenities.other).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Otros</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getAmenitiesByGroup(groupedAmenities.other).map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenitiesLabels[amenity]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      {property.notes && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información adicional</h2>
          <p className="text-gray-700 whitespace-pre-line">{property.notes}</p>
        </div>
      )}
    </div>
  );
}