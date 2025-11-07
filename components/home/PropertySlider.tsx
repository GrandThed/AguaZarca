'use client';

import React, { useState, useEffect } from 'react';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useSliderProperties } from '@/hooks/useProperties';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';

const PropertySlider: React.FC = () => {
  const { properties, loading, error } = useSliderProperties();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    if (properties.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % properties.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [properties.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % properties.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + properties.length) % properties.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="relative h-[600px] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Cargando slider...</div>
        </div>
      </div>
    );
  }

  if (error || !properties || properties.length === 0) {
    return null; // Don't show slider if no properties
  }

  const currentProperty = properties[currentSlide];

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Main Slider */}
      <div className="relative h-full">
        {properties.map((property, index) => (
          <div
            key={property.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' :
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div className="relative h-full">
              {property.images.length > 0 ? (
                <SafeImage
                  src={property.images[0].url}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800"></div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <div className="mb-4">
                    <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {property.comercialStatus}
                    </span>
                    {property.featured && (
                      <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium ml-2">
                        Destacado
                      </span>
                    )}
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    {property.title}
                  </h2>

                  <div className="flex items-center text-lg mb-4">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{property.neighborhood && `${property.neighborhood}, `}{property.city}</span>
                  </div>

                  {property.priceValue && (
                    <div className="flex items-center text-2xl font-bold mb-6">
                      <FaDollarSign className="mr-1" />
                      <span>{property.priceCurrency} {property.priceValue.toLocaleString()}</span>
                    </div>
                  )}

                  <p className="text-lg mb-8 line-clamp-3">
                    {property.description}
                  </p>

                  <div className="flex gap-4">
                    <Link
                      href={`/propiedades/${property.id}`}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {properties.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all"
            aria-label="Anterior"
          >
            <FaChevronLeft className="text-xl" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all"
            aria-label="Siguiente"
          >
            <FaChevronRight className="text-xl" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {properties.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Property Counter */}
      {properties.length > 1 && (
        <div className="absolute top-6 right-6 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentSlide + 1} / {properties.length}
        </div>
      )}
    </div>
  );
};

export default PropertySlider;