'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyDetailContent from '@/components/properties/PropertyDetailContent';
import { Property } from '@/types/property';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

export default function PropertyPreviewPage() {
  const router = useRouter();
  const [property, setProperty] = useState<Partial<Property> | null>(null);

  useEffect(() => {
    // Get property data from sessionStorage
    const previewData = sessionStorage.getItem('propertyPreview');
    if (previewData) {
      try {
        const parsedData = JSON.parse(previewData);
        setProperty(parsedData);
      } catch (error) {
        console.error('Error parsing preview data:', error);
        router.push('/admin/propiedades');
      }
    } else {
      router.push('/admin/propiedades');
    }
  }, [router]);

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.close()}
                className="btn-secondary flex items-center gap-2"
              >
                <FaArrowLeft />
                Cerrar Vista Previa
              </button>
              <div>
                <h1 className="text-xl font-semibold">Vista Previa de Propiedad</h1>
                <p className="text-gray-600 text-sm">
                  Esta es una vista previa de cómo se verá la propiedad publicada
                </p>
              </div>
            </div>

            <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
              <p className="text-yellow-800 text-sm font-medium">
                <FaEdit className="inline mr-2" />
                Modo Vista Previa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Content */}
      <div className="container mx-auto px-4 py-8">
        <PropertyDetailContent
          property={property as Property}
          relatedProperties={[]}
        />
      </div>

      {/* Footer Notice */}
      <div className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-gray-600 text-sm">
            Esta es una vista previa. La propiedad aún no ha sido publicada.
          </p>
        </div>
      </div>
    </div>
  );
}