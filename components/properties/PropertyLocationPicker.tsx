'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

// Set your Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface PropertyLocationPickerProps {
  initialLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  onLocationChange: (location: {
    address: string;
    latitude: number;
    longitude: number;
    neighborhood?: string;
    city?: string;
    state?: string;
  }) => void;
}

export default function PropertyLocationPicker({
  initialLocation,
  onLocationChange
}: PropertyLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [searching, setSearching] = useState(false);
  const [coordinates, setCoordinates] = useState({
    lat: initialLocation?.latitude || -34.6037,
    lng: initialLocation?.longitude || -58.3816
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [coordinates.lng, coordinates.lat],
      zoom: 14
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add initial marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#3B82F6'
    })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', () => {
      if (!marker.current) return;
      const lngLat = marker.current.getLngLat();
      handleLocationUpdate(lngLat.lat, lngLat.lng);
    });

    // Handle map click
    map.current.on('click', (e) => {
      if (!marker.current) return;
      marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      handleLocationUpdate(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleLocationUpdate = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });

    // Reverse geocoding to get address
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const address = feature.place_name || '';

        // Extract components
        const components: any = {};
        feature.context?.forEach((ctx: any) => {
          if (ctx.id.startsWith('neighborhood')) components.neighborhood = ctx.text;
          if (ctx.id.startsWith('place')) components.city = ctx.text;
          if (ctx.id.startsWith('region')) components.state = ctx.text;
        });

        onLocationChange({
          address,
          latitude: lat,
          longitude: lng,
          ...components
        });
        setSearchQuery(address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      onLocationChange({
        address: `${lat}, ${lng}`,
        latitude: lat,
        longitude: lng
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !map.current || !marker.current) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxgl.accessToken}&country=AR&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;

        // Update map and marker
        map.current.flyTo({
          center: [lng, lat],
          zoom: 15
        });
        marker.current.setLngLat([lng, lat]);

        // Extract components
        const components: any = {};
        feature.context?.forEach((ctx: any) => {
          if (ctx.id.startsWith('neighborhood')) components.neighborhood = ctx.text;
          if (ctx.id.startsWith('place')) components.city = ctx.text;
          if (ctx.id.startsWith('region')) components.state = ctx.text;
        });

        onLocationChange({
          address: feature.place_name,
          latitude: lat,
          longitude: lng,
          ...components
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar dirección..."
            className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary"
          />
          <FaMapMarkerAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <FaSearch />
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapContainer}
          className="h-[400px] rounded-lg border-2 border-gray-200"
        />
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-2 text-xs">
          <p className="font-medium">Coordenadas:</p>
          <p>Lat: {coordinates.lat.toFixed(6)}</p>
          <p>Lng: {coordinates.lng.toFixed(6)}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación exacta
      </p>
    </div>
  );
}