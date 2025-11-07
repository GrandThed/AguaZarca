'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  unoptimized?: boolean;
  onError?: () => void;
  style?: React.CSSProperties;
}

/**
 * SafeImage component that gracefully handles image loading errors
 * Falls back to a placeholder image when the main image fails to load
 */
export default function SafeImage({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  className = '',
  fill,
  width,
  height,
  priority = false,
  unoptimized = true,
  onError,
  style,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      onError?.();
    }
  };

  // Reset error state if src changes
  React.useEffect(() => {
    if (src !== imgSrc && hasError) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  // Validate URL to prevent obvious errors
  const isValidUrl = (url: string) => {
    if (!url) return false;
    // Allow relative URLs and absolute URLs
    if (url.startsWith('/')) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Use fallback immediately if URL is invalid
  const finalSrc = isValidUrl(imgSrc) ? imgSrc : fallbackSrc;

  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        unoptimized={unoptimized}
        onError={handleError}
        style={style}
      />
    );
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width || 300}
      height={height || 200}
      className={className}
      priority={priority}
      unoptimized={unoptimized}
      onError={handleError}
      style={style}
    />
  );
}