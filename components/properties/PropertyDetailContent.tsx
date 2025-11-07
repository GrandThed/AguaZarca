'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Property } from '@/types/property';
import { PropertyWithRelations } from '@/types/api';
import PropertyGallery from './PropertyGallery';
import PropertyInfo from './PropertyInfo';
import PropertyMap from './PropertyMap';
import ContactForm from './ContactForm';
import ShareButtons from './ShareButtons';
import PropertyCard from './PropertyCard';
import { formatPrice, getPropertyTypeLabel, getCommercialStatusLabel } from '@/lib/utils';
import { FaBed, FaBath, FaCar, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';
import { Shield, Edit, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyDetailContentProps {
  property: Property | PropertyWithRelations;
  relatedProperties: (Property | PropertyWithRelations)[];
}

export default function PropertyDetailContent({ property, relatedProperties }: PropertyDetailContentProps) {
  const { user } = useAuth();
  const [showContactForm, setShowContactForm] = useState(false);
  const isAgent = user?.role === 'agent' || user?.role === 'admin';

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

  const location = [
    'addressLine' in property ? property.addressLine : ('address' in property ? property.address : ''),
    property.neighborhood,
    property.city
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Unpublished Warning for Agents */}
      {!property.published && isAgent && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-700">
                Esta propiedad no está publicada. Solo es visible para agentes.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Generar enlace de vista previa
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Available Message for Public */}
      {!property.published && !isAgent && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Propiedad no disponible</h1>
          <p className="text-gray-600">Esta propiedad ya no está disponible o ha sido retirada del mercado.</p>
        </div>
      )}

      {(property.published || isAgent) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Property Gallery */}
          <PropertyGallery images={property.images || []} title={property.title} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Price */}
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <p className="text-lg text-gray-600 mb-2">{getPropertyTypeLabel(property.type)}</p>
                    {location && (
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{location}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 block mb-1">
                      {getCommercialStatusLabel(property.comercialStatus)}
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(property.priceValue || 0, property.priceCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Characteristics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-lg shadow-sm">
                {bedrooms !== undefined && (
                  <div className="flex items-center justify-center flex-col">
                    <FaBed className="text-2xl text-gray-600 mb-2" />
                    <span className="text-lg font-semibold">{bedrooms}</span>
                    <span className="text-sm text-gray-500">Habitaciones</span>
                  </div>
                )}
                {bathrooms !== undefined && (
                  <div className="flex items-center justify-center flex-col">
                    <FaBath className="text-2xl text-gray-600 mb-2" />
                    <span className="text-lg font-semibold">{bathrooms}</span>
                    <span className="text-sm text-gray-500">Baños</span>
                  </div>
                )}
                {garages !== undefined && (
                  <div className="flex items-center justify-center flex-col">
                    <FaCar className="text-2xl text-gray-600 mb-2" />
                    <span className="text-lg font-semibold">{garages}</span>
                    <span className="text-sm text-gray-500">Garajes</span>
                  </div>
                )}
                {coveredArea && (
                  <div className="flex items-center justify-center flex-col">
                    <FaRulerCombined className="text-2xl text-gray-600 mb-2" />
                    <span className="text-lg font-semibold">{coveredArea}</span>
                    <span className="text-sm text-gray-500">m² cubiertos</span>
                  </div>
                )}
              </div>

              {/* Property Info (Description, Characteristics, Amenities) */}
              <PropertyInfo property={property} />

              {/* Map */}
              {(property.latitude && property.longitude) && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicación</h2>
                  <PropertyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    address={location}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Form */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Contactar por esta propiedad</h2>
                {showContactForm ? (
                  <ContactForm propertyId={String(property.id)} propertyTitle={property.title} />
                ) : (
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mostrar formulario de contacto
                  </button>
                )}
              </div>

              {/* Share Buttons */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Compartir</h2>
                <ShareButtons property={property} />
              </div>

              {/* Agent Actions */}
              {isAgent && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones de agente</h2>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Editar propiedad
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Duplicar propiedad
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Eliminar propiedad
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Properties */}
          {relatedProperties.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Propiedades similares</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProperties.map((relatedProperty) => (
                  <PropertyCard key={relatedProperty.id} property={relatedProperty} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}