'use client';

import React, { useEffect, useRef, useState } from 'react';

interface OptimizedImageProps {
  src: string; // Original image URL
  alt: string;
  optimizedVersions?: any; // JSON from backend with optimized URLs
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Custom hook for lazy loading with Intersection Observer
 */
function useLazyLoad(enabled: boolean = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.disconnect();
        }
      },
      {
        // Start loading 50px before the image enters viewport
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [enabled]);

  return [ref, isIntersecting] as const;
}

/**
 * Optimized image component that serves responsive images
 * with WebP support and lazy loading
 */
export default function OptimizedImage({
  src,
  alt,
  optimizedVersions,
  className = '',
  sizes = '100vw',
  priority = false,
  onLoad,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [imageRef, shouldLoad] = useLazyLoad(!priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Parse optimized versions if it's a string
  const versions = typeof optimizedVersions === 'string'
    ? JSON.parse(optimizedVersions)
    : optimizedVersions;

  // Generate srcset for responsive images
  const generateSrcSet = (format: 'webp' | 'jpeg'): string => {
    if (!versions) return '';

    const srcset: string[] = [];
    const sizeMap = {
      sm: 400,
      md: 800,
      lg: 1200,
      xl: 1920
    };

    Object.entries(sizeMap).forEach(([suffix, width]) => {
      if (versions[suffix]?.[format]) {
        srcset.push(`${versions[suffix][format]} ${width}w`);
      }
    });

    return srcset.join(', ');
  };

  // Get the best available image URL
  const getFallbackSrc = (): string => {
    if (!versions) return src;

    // Try to get a medium-sized optimized version as default
    return versions.lg?.jpeg || versions.md?.jpeg || src;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    // Fallback to original source if optimized versions fail
    if (versions) {
      setError(false); // Reset error state for retry with original
    }
  };

  // If image hasn't entered viewport yet, show placeholder
  if (!shouldLoad && !priority) {
    return (
      <div
        ref={imageRef}
        className={`${className} bg-gray-200 animate-pulse`}
        style={{ aspectRatio: '16/9' }}
        aria-label={alt}
      />
    );
  }

  // If there was an error and we have versions, fallback to original
  if (error && versions) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
      />
    );
  }

  // If we have optimized versions, use picture element for art direction
  if (versions && Object.keys(versions).length > 0) {
    const webpSrcSet = generateSrcSet('webp');
    const jpegSrcSet = generateSrcSet('jpeg');

    return (
      <div ref={imageRef} className="relative">
        {/* Blur placeholder while loading */}
        {placeholder === 'blur' && !isLoaded && blurDataURL && (
          <img
            src={blurDataURL}
            alt=""
            className={`${className} absolute inset-0 filter blur-lg`}
            aria-hidden="true"
          />
        )}

        <picture>
          {/* WebP sources for modern browsers */}
          {webpSrcSet && (
            <source
              type="image/webp"
              srcSet={webpSrcSet}
              sizes={sizes}
            />
          )}

          {/* JPEG sources as fallback */}
          {jpegSrcSet && (
            <source
              type="image/jpeg"
              srcSet={jpegSrcSet}
              sizes={sizes}
            />
          )}

          {/* Default img tag with fallback */}
          <img
            src={getFallbackSrc()}
            alt={alt}
            className={`${className} ${!isLoaded && placeholder === 'blur' ? 'opacity-0' : ''} transition-opacity duration-300`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      </div>
    );
  }

  // Fallback to regular img tag if no optimized versions
  return (
    <div ref={imageRef}>
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * Wrapper component for property images with proper sizing
 */
export function PropertyImage({
  image,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false
}: {
  image: any;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={image.url}
      alt={image.originalName || 'Property image'}
      optimizedVersions={image.optimizedVersions}
      className={className}
      sizes={sizes}
      priority={priority}
      placeholder={image.thumbnailUrl ? 'blur' : 'empty'}
      blurDataURL={image.thumbnailUrl}
    />
  );
}