'use client';

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address?: string;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export default function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 15,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker
    const marker = new mapboxgl.Marker({ color: '#3B82F6' })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Add popup if address is provided
    if (address) {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setText(address);
      marker.setPopup(popup);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [latitude, longitude, address]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-96 rounded-lg overflow-hidden" />
      {!mapboxgl.accessToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-500">Mapa no disponible</p>
        </div>
      )}
    </div>
  );
}