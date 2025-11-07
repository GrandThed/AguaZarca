'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyImage } from '@/types/property';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages = images.length > 0 ? images : [{ url: '/placeholder.svg', order: 0 }];

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Main Image */}
        <div className="relative h-96 md:h-[500px] group">
          <Image
            src={displayImages[selectedImage].url}
            alt={`${title} - Imagen ${selectedImage + 1}`}
            fill
            className="object-cover"
            unoptimized
            priority
          />

          {/* Navigation Buttons */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Expand Button */}
          <button
            onClick={openLightbox}
            className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
            aria-label="Ver en pantalla completa"
          >
            <Expand className="h-5 w-5" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white rounded-full text-sm">
            {selectedImage + 1} / {displayImages.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                <Image
                  src={image.url}
                  alt={`${title} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto p-4">
            <Image
              src={displayImages[selectedImage].url}
              alt={`${title} - Imagen ${selectedImage + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white rounded-full text-sm">
            {selectedImage + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  );
}