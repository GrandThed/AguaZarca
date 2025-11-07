'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PropertyImage } from '@/types/api';
import { FaExpand, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ImageGalleryProps {
  images: PropertyImage[];
  title?: string;
  showThumbnails?: boolean;
}

export default function ImageGallery({
  images,
  title = 'Galería',
  showThumbnails = true,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">No hay imágenes disponibles</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsFullscreen(false);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[16/9]">
          <Image
            src={images[selectedIndex].url}
            alt={`${title} - Imagen ${selectedIndex + 1}`}
            fill
            className="object-contain"
            priority
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Imagen anterior"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Siguiente imagen"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            aria-label="Ver en pantalla completa"
          >
            <FaExpand />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                  ${
                    index === selectedIndex
                      ? 'border-blue-500 ring-2 ring-blue-500/50'
                      : 'border-transparent hover:border-gray-300'
                  }
                `}
              >
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={`Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
          onKeyDown={handleKeyDown as any}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-10"
            aria-label="Cerrar"
          >
            <FaTimes className="text-xl" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-10"
                aria-label="Imagen anterior"
              >
                <FaChevronLeft className="text-xl" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-10"
                aria-label="Siguiente imagen"
              >
                <FaChevronRight className="text-xl" />
              </button>
            </>
          )}

          <div className="relative w-full h-full p-8">
            <Image
              src={images[selectedIndex].url}
              alt={`${title} - Imagen ${selectedIndex + 1}`}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 text-white rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}