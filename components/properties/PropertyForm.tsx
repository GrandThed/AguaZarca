'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Property, PropertyType, PropertyStatus, CommercialStatus } from '@/types/property';
import ImageUploader from '@/components/images/ImageUploader';
import SimpleImageReorder from '@/components/images/SimpleImageReorder';
import PropertyLocationPicker from '@/components/properties/PropertyLocationPicker';
import MercadoLibreImport from '@/components/mercadolibre/MercadoLibreImport';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import { FaSave, FaEye, FaSpinner, FaFileImport } from 'react-icons/fa';
import { useDebounce } from '@/hooks/useDebounce';

// Validation schema
const propertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  type: z.nativeEnum(PropertyType),
  commercial_status: z.nativeEnum(CommercialStatus),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  currency: z.enum(['USD', 'ARS']).default('USD'),

  // Location
  address: z.string().min(5, 'La dirección es requerida'),
  neighborhood: z.string().optional(),
  city: z.string().min(2, 'La ciudad es requerida'),
  state: z.string().min(2, 'La provincia es requerida'),
  country: z.string().default('Argentina'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Characteristics
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  covered_area: z.number().min(0).optional(),
  uncovered_area: z.number().min(0).optional(),
  total_area: z.number().min(0).optional(),
  floors: z.number().min(0).optional(),
  garage_spaces: z.number().min(0).optional(),

  // Attributes (amenities)
  attributes: z.object({
    pool: z.boolean().optional(),
    garden: z.boolean().optional(),
    terrace: z.boolean().optional(),
    balcony: z.boolean().optional(),
    barbecue: z.boolean().optional(),
    gym: z.boolean().optional(),
    security: z.boolean().optional(),
    elevator: z.boolean().optional(),
    parking: z.boolean().optional(),
    laundry: z.boolean().optional(),
    storage: z.boolean().optional(),
    heating: z.boolean().optional(),
    air_conditioning: z.boolean().optional(),
    furnished: z.boolean().optional(),
    pets_allowed: z.boolean().optional(),
  }).optional(),

  // Media
  images: z.array(z.string()).optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  virtual_tour_url: z.string().url().optional().or(z.literal('')),

  // Status
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.DRAFT),
  featured: z.boolean().default(false),
  rental_featured: z.boolean().default(false),
  slider: z.boolean().default(false),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyFormData, isDraft?: boolean) => Promise<void>;
  onPreview?: (data: PropertyFormData) => void;
  loading?: boolean;
  draftId?: string | null;
}

export default function PropertyForm({
  property,
  onSubmit,
  onPreview,
  loading = false,
  draftId
}: PropertyFormProps) {
  const [images, setImages] = useState<string[]>(property?.images || []);
  const [showMLImport, setShowMLImport] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property || {
      currency: 'USD',
      country: 'Argentina',
      status: PropertyStatus.DRAFT,
      attributes: {},
    }
  });

  const watchedData = watch();
  const debouncedData = useDebounce(watchedData, 2000);

  // Autosave functionality
  useEffect(() => {
    if (draftId && isDirty) {
      const currentData = JSON.stringify(debouncedData);
      if (currentData !== lastSavedDataRef.current) {
        handleAutosave();
        lastSavedDataRef.current = currentData;
      }
    }
  }, [debouncedData, draftId, isDirty]);

  const handleAutosave = useCallback(async () => {
    if (!draftId || autosaving) return;

    setAutosaving(true);
    try {
      const formData = { ...debouncedData, images };
      await api.patch(`/properties/draft/${draftId}`, formData);
      toast.success('Guardado automático completado', {
        autoClose: 1000,
        hideProgressBar: true
      });
    } catch (error) {
      console.error('Autosave error:', error);
    } finally {
      setAutosaving(false);
    }
  }, [draftId, debouncedData, images, autosaving]);

  // Handle image upload
  const handleImageUpload = (newImages: string[]) => {
    setImages(prev => [...prev, ...newImages]);
    setValue('images', [...images, ...newImages]);
  };

  // Handle image reorder
  const handleImageReorder = (reorderedImages: string[]) => {
    setImages(reorderedImages);
    setValue('images', reorderedImages);
  };

  // Handle image delete
  const handleImageDelete = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue('images', newImages);
  };

  // Handle MercadoLibre import
  const handleMLImport = (importedData: Partial<PropertyFormData>) => {
    if (!importedData) {
      toast.error('No se recibieron datos para importar');
      return;
    }

    Object.entries(importedData).forEach(([key, value]) => {
      setValue(key as keyof PropertyFormData, value as any);
    });

    if (importedData.images) {
      setImages(importedData.images);
    }

    setShowMLImport(false);
    toast.success('Datos importados correctamente');
  };

  // Handle location update
  const handleLocationUpdate = (location: {
    address: string;
    latitude: number;
    longitude: number;
    neighborhood?: string;
    city?: string;
    state?: string;
  }) => {
    setValue('address', location.address);
    setValue('latitude', location.latitude);
    setValue('longitude', location.longitude);
    if (location.neighborhood) setValue('neighborhood', location.neighborhood);
    if (location.city) setValue('city', location.city);
    if (location.state) setValue('state', location.state);
  };

  const onFormSubmit = async (data: PropertyFormData) => {
    const finalData = { ...data, images };
    await onSubmit(finalData, false);
  };

  const onSaveDraft = async () => {
    const data = watch();
    const finalData = { ...data, images, status: PropertyStatus.DRAFT };
    await onSubmit(finalData, true);
  };

  const onPreviewClick = () => {
    const data = watch();
    const finalData = { ...data, images };
    onPreview?.(finalData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* MercadoLibre Import Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Importar desde MercadoLibre</h2>
          <button
            type="button"
            onClick={() => setShowMLImport(!showMLImport)}
            className="btn-secondary flex items-center gap-2"
          >
            <FaFileImport />
            {showMLImport ? 'Cerrar' : 'Importar'}
          </button>
        </div>

        {showMLImport && (
          <MercadoLibreImport onImport={handleMLImport} />
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Título *
            </label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Ej: Casa moderna en barrio residencial"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Tipo de Propiedad *
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar</option>
              {Object.values(PropertyType).map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Estado Comercial *
            </label>
            <select
              {...register('commercial_status')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar</option>
              {Object.values(CommercialStatus).map(status => (
                <option key={status} value={status}>
                  {status === CommercialStatus.SALE ? 'Venta' :
                   status === CommercialStatus.RENT ? 'Alquiler' :
                   'Alquiler Temporal'}
                </option>
              ))}
            </select>
            {errors.commercial_status && (
              <p className="text-red-500 text-sm mt-1">{errors.commercial_status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Precio *
            </label>
            <div className="flex gap-2">
              <select
                {...register('currency')}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Descripción *
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            rows={4}
            placeholder="Describe la propiedad en detalle..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ubicación</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Dirección *
            </label>
            <input
              {...register('address')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Calle y número"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Barrio
            </label>
            <input
              {...register('neighborhood')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Nombre del barrio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Ciudad *
            </label>
            <input
              {...register('city')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Ciudad"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Provincia *
            </label>
            <input
              {...register('state')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Provincia"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Map Location Picker */}
        <PropertyLocationPicker
          initialLocation={{
            latitude: watchedData.latitude,
            longitude: watchedData.longitude,
            address: watchedData.address
          }}
          onLocationChange={handleLocationUpdate}
        />
      </div>

      {/* Characteristics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Características</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Dormitorios
            </label>
            <input
              type="number"
              {...register('bedrooms', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Baños
            </label>
            <input
              type="number"
              {...register('bathrooms', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Superficie Cubierta (m²)
            </label>
            <input
              type="number"
              {...register('covered_area', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Superficie Descubierta (m²)
            </label>
            <input
              type="number"
              {...register('uncovered_area', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Superficie Total (m²)
            </label>
            <input
              type="number"
              {...register('total_area', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Pisos
            </label>
            <input
              type="number"
              {...register('floors', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Cocheras
            </label>
            <input
              type="number"
              {...register('garage_spaces', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Comodidades</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { key: 'pool', label: 'Piscina' },
            { key: 'garden', label: 'Jardín' },
            { key: 'terrace', label: 'Terraza' },
            { key: 'balcony', label: 'Balcón' },
            { key: 'barbecue', label: 'Parrilla' },
            { key: 'gym', label: 'Gimnasio' },
            { key: 'security', label: 'Seguridad' },
            { key: 'elevator', label: 'Ascensor' },
            { key: 'parking', label: 'Estacionamiento' },
            { key: 'laundry', label: 'Lavadero' },
            { key: 'storage', label: 'Baulera' },
            { key: 'heating', label: 'Calefacción' },
            { key: 'air_conditioning', label: 'Aire Acondicionado' },
            { key: 'furnished', label: 'Amoblado' },
            { key: 'pets_allowed', label: 'Acepta Mascotas' },
          ].map(amenity => (
            <label key={amenity.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register(`attributes.${amenity.key}` as any)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-900">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Imágenes</h2>

        <ImageUploader
          onUpload={handleImageUpload}
          maxFiles={20}
          maxSize={5 * 1024 * 1024} // 5MB
        />

        {images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Imágenes cargadas</h3>
            <SimpleImageReorder
              images={images}
              onReorder={handleImageReorder}
              onDelete={handleImageDelete}
            />
          </div>
        )}
      </div>

      {/* Media */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Multimedia</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              URL de Video
            </label>
            <input
              {...register('video_url')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="https://youtube.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              URL de Tour Virtual
            </label>
            <input
              {...register('virtual_tour_url')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Status Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Opciones de Visualización</h2>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('featured')}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-gray-900">Destacado en Ventas</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('rental_featured')}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-gray-900">Destacado en Alquileres</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('slider')}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-gray-900">Mostrar en Slider Principal</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        {autosaving && (
          <div className="flex items-center gap-2 text-gray-500">
            <FaSpinner className="animate-spin" />
            <span className="text-sm">Guardando automáticamente...</span>
          </div>
        )}

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <FaSave />
          Guardar Borrador
        </button>

        {onPreview && (
          <button
            type="button"
            onClick={onPreviewClick}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <FaEye />
            Vista Previa
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Publicando...
            </>
          ) : (
            'Publicar Propiedad'
          )}
        </button>
      </div>
    </form>
  );
}