'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

// Fix for default marker icon in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface PropertyLocationPickerRef {
  searchAddress: (address: string) => Promise<void>;
}

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

// Component to handle map events
function MapEventHandler({
  onLocationSelect
}: {
  onLocationSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map view
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

const PropertyLocationPickerComponent = forwardRef<PropertyLocationPickerRef, PropertyLocationPickerProps>(
  ({ initialLocation, onLocationChange }, ref) => {
    const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
    const [searching, setSearching] = useState(false);
    const [coordinates, setCoordinates] = useState<[number, number]>([
      initialLocation?.latitude || -31.4201, // Córdoba, Argentina
      initialLocation?.longitude || -64.1888
    ]);
    const [zoom, setZoom] = useState(14);
    const markerRef = useRef<L.Marker>(null);

    // Expose searchAddress method via ref
    useImperativeHandle(ref, () => ({
      searchAddress: async (address: string) => {
        if (!address) return;
        // Keep the original address in search query for display
        setSearchQuery(address);

        setSearching(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              address
            )}&countrycodes=ar&addressdetails=1&limit=1`,
            {
              headers: {
                'User-Agent': 'AguaZarca-PropertyApp/1.0'
              }
            }
          );
          const data = await response.json();

          if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            const addressData = result.address || {};

            setCoordinates([lat, lng]);
            setZoom(15);

            // Keep the original imported address, but update coordinates and other location details from nominatim
            onLocationChange({
              address: address, // Keep original address instead of display_name
              latitude: lat,
              longitude: lng,
              neighborhood: addressData.suburb || addressData.neighbourhood || addressData.hamlet,
              city: addressData.city || addressData.town || addressData.village,
              state: addressData.state || addressData.province || 'Córdoba'
            });
            // Keep original address in search query
            setSearchQuery(address);
          }
        } catch (error) {
          console.error('Error searching location:', error);
        } finally {
          setSearching(false);
        }
      }
    }), [onLocationChange]);

    const handleLocationUpdate = async (lat: number, lng: number) => {
      setCoordinates([lat, lng]);

      // Reverse geocoding using Nominatim (OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'AguaZarca-PropertyApp/1.0'
            }
          }
        );
        const data = await response.json();

        if (data && data.display_name) {
          const address = data.display_name || '';
          const addressData = data.address || {};

          onLocationChange({
            address,
            latitude: lat,
            longitude: lng,
            neighborhood: addressData.suburb || addressData.neighbourhood || addressData.hamlet,
            city: addressData.city || addressData.town || addressData.village,
            state: addressData.state || addressData.province || 'Córdoba'
          });
          setSearchQuery(address);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        onLocationChange({
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng
        });
      }
    };

    const handleSearch = async () => {
      if (!searchQuery) return;

      setSearching(true);
      try {
        // Forward geocoding using Nominatim (OpenStreetMap)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=ar&addressdetails=1&limit=1`,
          {
            headers: {
              'User-Agent': 'AguaZarca-PropertyApp/1.0'
            }
          }
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          const addressData = result.address || {};

          // Update map and coordinates
          setCoordinates([lat, lng]);
          setZoom(15);

          onLocationChange({
            address: result.display_name,
            latitude: lat,
            longitude: lng,
            neighborhood: addressData.suburb || addressData.neighbourhood || addressData.hamlet,
            city: addressData.city || addressData.town || addressData.village,
            state: addressData.state || addressData.province || 'Córdoba'
          });
          setSearchQuery(result.display_name);
        } else {
          alert('No se encontró la dirección. Intenta con otra búsqueda.');
        }
      } catch (error) {
        console.error('Error searching location:', error);
        alert('Error al buscar la dirección. Por favor intenta nuevamente.');
      } finally {
        setSearching(false);
      }
    };

    // Handle marker drag
    const handleMarkerDrag = () => {
      const marker = markerRef.current;
      if (marker) {
        const position = marker.getLatLng();
        handleLocationUpdate(position.lat, position.lng);
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
          <div className="h-[400px] rounded-lg border-2 border-gray-200 overflow-hidden">
            <MapContainer
              center={coordinates}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={coordinates}
                draggable={true}
                eventHandlers={{
                  dragend: handleMarkerDrag,
                }}
                ref={markerRef}
              />
              <MapEventHandler onLocationSelect={handleLocationUpdate} />
              <MapUpdater center={coordinates} zoom={zoom} />
            </MapContainer>
          </div>
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-2 text-xs" style={{ zIndex: 999 }}>
            <p className="font-medium">Coordenadas:</p>
            <p>Lat: {coordinates[0].toFixed(6)}</p>
            <p>Lng: {coordinates[1].toFixed(6)}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación exacta
        </p>

        <p className="text-xs text-gray-500">
          Mapas proporcionados por <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenStreetMap</a>
        </p>
      </div>
    );
  }
);

PropertyLocationPickerComponent.displayName = 'PropertyLocationPicker';

export default PropertyLocationPickerComponent;
