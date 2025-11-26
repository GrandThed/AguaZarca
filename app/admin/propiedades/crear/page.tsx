'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/properties/PropertyForm';
import { toast } from 'react-toastify';
import api from '@/lib/api';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const handleSubmit = async (data: any, isDraft: boolean = false) => {
    setLoading(true);
    try {
      // Helper function to extract YouTube video ID
      const extractYoutubeId = (url: string): string | undefined => {
        if (!url) return undefined;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return match ? match[1] : undefined;
      };

      // Map frontend field names to backend field names
      const mappedData = {
        // Basic info
        title: data.title,
        description: data.description,
        type: data.type,
        comercialStatus: data.commercial_status,
        priceValue: data.price ? parseFloat(data.price) : null,
        priceCurrency: data.currency || 'USD',

        // Location
        addressLine: data.address,
        neighborhood: data.neighborhood || '',
        city: data.city,
        state: data.state || 'Córdoba',
        country: data.country || 'Argentina',

        // Characteristics (convert numeric fields to characteristic objects)
        characteristics: [
          ...(data.bedrooms !== undefined && data.bedrooms !== null ? [{ name: 'bedrooms', value: String(data.bedrooms) }] : []),
          ...(data.bathrooms !== undefined && data.bathrooms !== null ? [{ name: 'bathrooms', value: String(data.bathrooms) }] : []),
          ...(data.covered_area !== undefined && data.covered_area !== null ? [{ name: 'covered_area', value: String(data.covered_area) }] : []),
          ...(data.total_area !== undefined && data.total_area !== null ? [{ name: 'total_area', value: String(data.total_area) }] : []),
          ...(data.floors !== undefined && data.floors !== null ? [{ name: 'floors', value: String(data.floors) }] : []),
          ...(data.garage_spaces !== undefined && data.garage_spaces !== null ? [{ name: 'garage_spaces', value: String(data.garage_spaces) }] : []),
        ],

        // Attributes (amenities) - only include if explicitly set to true
        attributes: data.attributes ? Object.entries(data.attributes)
          .filter(([_, value]) => value === true)
          .map(([name, value]) => ({
            name,
            value: true,
          })) : [],

        // Media - convert image URLs to image objects
        images: (data.images || []).map((url: string, index: number) => ({
          url,
          filename: `property-image-${index}`,
          thumbnailFilename: `thumb-property-image-${index}`,
          originalName: `image-${index}.jpg`,
          thumbnailUrl: url,
          size: 0,
          width: 0,
          height: 0,
          mimeType: 'image/jpeg',
          order: index,
        })),
        videoId: extractYoutubeId(data.video_url),

        // Status - remove status field, use published instead
        featured: data.featured || false,
        rentalFeatured: data.rental_featured || false,
        slider: data.slider || false,
        published: data.status === 'PUBLISHED' ? true : false,
      };

      const endpoint = isDraft ? '/properties/draft' : '/properties';
      const response = await api.post(endpoint, mappedData);

      if (response.data.success) {
        if (isDraft) {
          setDraftId(response.data.data.id);
          toast.success('Borrador guardado correctamente');
        } else {
          toast.success('Propiedad publicada correctamente');
          router.push('/admin/propiedades');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al guardar la propiedad';
      toast.error(errorMessage);
      console.error('Error saving property:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (data: any) => {
    // Store in sessionStorage for preview
    sessionStorage.setItem('propertyPreview', JSON.stringify(data));
    window.open('/admin/propiedades/preview', '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nueva Propiedad</h1>
      <PropertyForm
        onSubmit={handleSubmit}
        onPreview={handlePreview}
        loading={loading}
        draftId={draftId}
      />
    </div>
  );
}