'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Property, PropertyType, PropertyStatus, CommercialStatus } from '@/types/property';
import ImageUploader from '@/components/images/ImageUploader';
import SimpleImageReorder from '@/components/images/SimpleImageReorder';
import PropertyLocationPicker, { PropertyLocationPickerRef } from '@/components/properties/PropertyLocationPicker';
import MercadoLibreImport from '@/components/mercadolibre/MercadoLibreImport';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import { FaSave, FaEye, FaSpinner, FaFileImport, FaExclamationTriangle } from 'react-icons/fa';
import { useDebounce } from '@/hooks/useDebounce';
import { getMercadoLibreStatus } from '@/lib/api-client';

// Validation schema
const propertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  type: z.enum([
    PropertyType.CASA,
    PropertyType.DEPARTAMENTO,
    PropertyType.PH,
    PropertyType.OFICINA,
    PropertyType.LOCAL,
    PropertyType.TERRENO,
    PropertyType.GALPON,
    PropertyType.COCHERA,
    PropertyType.QUINTA,
    PropertyType.CAMPO,
    PropertyType.HOTEL,
    PropertyType.EDIFICIO,
    PropertyType.COUNTRY,
    PropertyType.DEPOSITO,
    PropertyType.FONDO_COMERCIO,
    PropertyType.CABANA,
    PropertyType.OTRO
  ] as const, {
    message: 'Por favor seleccione un tipo de propiedad'
  }),
  commercial_status: z.enum([
    CommercialStatus.SALE,
    CommercialStatus.ANNUAL_RENT,
    CommercialStatus.TEMPORARY_RENT
  ] as const, {
    message: 'Por favor seleccione un estado comercial'
  }),
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
  video_url: z.string().url('Por favor ingrese una URL válida').optional().or(z.literal('')),
  virtual_tour_url: z.string().url('Por favor ingrese una URL válida').optional().or(z.literal('')),

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
  const [images, setImages] = useState<string[]>(
    property?.images ? property.images.map(img => typeof img === 'string' ? img : img.url) : []
  );
  const [showMLImport, setShowMLImport] = useState(false);
  const [mlConnected, setMlConnected] = useState(false);
  const [checkingMLStatus, setCheckingMLStatus] = useState(true);
  const [autosaving, setAutosaving] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const locationPickerRef = useRef<PropertyLocationPickerRef>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: (property || {
      currency: 'USD',
      country: 'Argentina',
      status: PropertyStatus.DRAFT,
      attributes: {},
    }) as any
  });

  const watchedData = watch();
  const debouncedData = useDebounce(watchedData, 2000);

  // Check MercadoLibre connection status on mount
  useEffect(() => {
    const checkMLConnection = async () => {
      try {
        const status = await getMercadoLibreStatus();
        setMlConnected(status.connected);
      } catch (error) {
        console.error('Error checking ML status:', error);
        setMlConnected(false);
      } finally {
        setCheckingMLStatus(false);
      }
    };
    checkMLConnection();
  }, []);

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
  const handleImageUpload = (uploadedImages: any[]) => {
    const newImageUrls = uploadedImages.map(img => img.url);
    setImages(prev => [...prev, ...newImageUrls]);
    setValue('images', [...images, ...newImageUrls]);
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
  const handleMLImport = async (importedData: any) => {
    if (!importedData) {
      toast.error('No se recibieron datos para importar');
      return;
    }

    console.log('ML Import data received:', importedData);

    // Extract images - handle both array of strings and array of objects with url property
    let imageUrls: string[] = [];
    if (importedData.images && Array.isArray(importedData.images)) {
      imageUrls = importedData.images.map((img: any) =>
        typeof img === 'string' ? img : (img.url || '')
      ).filter((url: string) => url !== '');
    }

    console.log('Extracted image URLs:', imageUrls);

    // Map the imported data to form fields
    // MercadoLibre returns different field names, so we need to map them
    const mappedData: any = {
      title: importedData.title,
      description: importedData.description,
      type: importedData.type,
      commercial_status: importedData.comercialStatus || importedData.commercial_status,
      price: importedData.priceValue || importedData.price,
      currency: importedData.priceCurrency || importedData.currency || 'USD',
      address: importedData.addressLine || importedData.address,
      neighborhood: importedData.neighborhood,
      city: importedData.city,
      state: importedData.state || 'Córdoba',
      country: importedData.country || 'Argentina',
      latitude: importedData.latitude,
      longitude: importedData.longitude,
      video_url: importedData.videoId ? `https://www.youtube.com/watch?v=${importedData.videoId}` : '',
    };

    // Map characteristics if available
    if (importedData.characteristics && Array.isArray(importedData.characteristics)) {
      importedData.characteristics.forEach((char: any) => {
        const name = char.name?.toLowerCase();
        const value = parseInt(char.value) || 0;

        if (name?.includes('dormitorio') || name?.includes('bedroom')) {
          mappedData.bedrooms = value;
        } else if (name?.includes('baño') || name?.includes('bathroom')) {
          mappedData.bathrooms = value;
        } else if (name?.includes('cochera') || name?.includes('parking') || name?.includes('garage')) {
          mappedData.garage_spaces = value;
        } else if (name?.includes('superficie cubierta') || name?.includes('covered area')) {
          mappedData.covered_area = value;
        } else if (name?.includes('superficie total') || name?.includes('total area')) {
          mappedData.total_area = value;
        } else if (name?.includes('piso') || name?.includes('floor')) {
          mappedData.floors = value;
        }
      });
    }

    // Map attributes/amenities if available
    if (importedData.attributes && Array.isArray(importedData.attributes)) {
      const attrs: any = {};
      importedData.attributes.forEach((attr: any) => {
        const name = attr.name?.toLowerCase();
        const value = attr.value === true || attr.value === 'true';

        if (name?.includes('pileta') || name?.includes('pool') || name?.includes('piscina')) {
          attrs.pool = value;
        } else if (name?.includes('jardín') || name?.includes('garden')) {
          attrs.garden = value;
        } else if (name?.includes('terraza') || name?.includes('terrace')) {
          attrs.terrace = value;
        } else if (name?.includes('balcón') || name?.includes('balcony')) {
          attrs.balcony = value;
        } else if (name?.includes('parrilla') || name?.includes('barbecue') || name?.includes('asador')) {
          attrs.barbecue = value;
        } else if (name?.includes('gimnasio') || name?.includes('gym')) {
          attrs.gym = value;
        } else if (name?.includes('seguridad') || name?.includes('security')) {
          attrs.security = value;
        } else if (name?.includes('ascensor') || name?.includes('elevator')) {
          attrs.elevator = value;
        } else if (name?.includes('cochera') || name?.includes('parking')) {
          attrs.parking = value;
        } else if (name?.includes('calefacción') || name?.includes('heating')) {
          attrs.heating = value;
        } else if (name?.includes('aire') || name?.includes('conditioning') || name?.includes('a/c')) {
          attrs.air_conditioning = value;
        } else if (name?.includes('amoblado') || name?.includes('furnished')) {
          attrs.furnished = value;
        }
      });
      mappedData.attributes = attrs;
    }

    console.log('Mapped form data:', mappedData);

    // Set all form values
    Object.entries(mappedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        setValue(key as keyof PropertyFormData, value as any);
      }
    });

    // Set images
    if (imageUrls.length > 0) {
      setImages(imageUrls);
      setValue('images', imageUrls);
    }

    setShowMLImport(false);
    toast.success(`Datos importados correctamente. ${imageUrls.length} imágenes cargadas.`);

    // Trigger automatic geocoding for the imported address
    const completeAddress = mappedData.address;
    if (completeAddress && locationPickerRef.current) {
      try {
        console.log('Triggering automatic location search for:', completeAddress);
        await locationPickerRef.current.searchAddress(completeAddress);
        toast.success('Ubicación geocodificada automáticamente');
      } catch (error) {
        console.error('Error geocoding imported address:', error);
        toast.info('La dirección se importó pero no pudimos geocodificarla automáticamente');
      }
    }
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

  const onFormSubmit = async (data: any) => {
    const finalData = { ...data, images };
    await onSubmit(finalData, false);
  };

  const onSaveDraft = async () => {
    const data = watch();
    const finalData = { ...data, images, status: PropertyStatus.DRAFT } as any;
    await onSubmit(finalData, true);
  };

  const onPreviewClick = () => {
    const data = watch();
    const finalData = { ...data, images } as any;
    onPreview?.(finalData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* MercadoLibre Import Section - Only show if connected */}
      {!checkingMLStatus && mlConnected && (
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
      )}

      {/* ML Not Connected Message */}
      {!checkingMLStatus && !mlConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">MercadoLibre no conectado</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Conecta tu cuenta de MercadoLibre para importar propiedades directamente.
              </p>
              <a
                href="/admin/mercadolibre"
                className="inline-block mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
              >
                Ir a configuración de MercadoLibre →
              </a>
            </div>
          </div>
        </div>
      )}

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
                  {type}
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
                  {status}
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
                {...register('price')}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
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
          ref={locationPickerRef}
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
          onImagesUploaded={handleImageUpload}
          maxFiles={20}
          maxSize={5}
          existingImagesCount={images.length}
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

      </form>

      {/* Fixed Action Buttons at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 md:p-6" style={{ zIndex: 9999 }}>
        <div className="flex flex-col sm:flex-row gap-3 justify-end items-center pr-4 md:pr-8">
          {autosaving && (
            <div className="flex items-center gap-2 text-gray-500 order-last sm:order-first">
              <FaSpinner className="animate-spin text-sm" />
              <span className="text-sm font-medium">Guardando automáticamente...</span>
            </div>
          )}

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:opacity-50 text-gray-900 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 hover:shadow-md"
          >
            <FaSave className="text-base" />
            <span>Guardar Borrador</span>
          </button>

          {onPreview && (
            <button
              type="button"
              onClick={onPreviewClick}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-50 hover:bg-blue-100 disabled:bg-blue-50 disabled:opacity-50 text-blue-700 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-blue-300 hover:border-blue-400 hover:shadow-md"
            >
              <FaEye className="text-base" />
              <span>Vista Previa</span>
            </button>
          )}

          <button
            type="button"
            onClick={async () => {
              const data = watch();
              const finalData = { ...data, images };
              await onSubmit(finalData, false);
            }}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-500 disabled:to-green-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin text-base" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <span>Publicar Propiedad</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add padding to body to prevent overlap with fixed buttons */}
      <div className="h-24" />

      <style jsx>{`
        :global(body) {
          padding-bottom: 120px;
        }
      `}</style>
    </div>
  );
}