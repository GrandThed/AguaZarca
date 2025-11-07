'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/properties/PropertyForm';
import { Property } from '@/types/property';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api-client';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const handleSubmit = async (data: Partial<Property>, isDraft: boolean = false) => {
    setLoading(true);
    try {
      const endpoint = isDraft ? '/api/properties/draft' : '/api/properties';
      const response = await apiClient.post(endpoint, data);

      if (response.data.success) {
        if (isDraft) {
          setDraftId(response.data.data.id);
          toast.success('Borrador guardado correctamente');
        } else {
          toast.success('Propiedad publicada correctamente');
          router.push('/admin/propiedades');
        }
      }
    } catch (error) {
      toast.error('Error al guardar la propiedad');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (data: Partial<Property>) => {
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