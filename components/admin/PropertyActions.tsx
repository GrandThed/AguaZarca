'use client';

import { useState } from 'react';
import { PropertyWithRelations } from '@/types/api';
import {
  togglePropertyPublished,
  togglePropertyFeatured,
  deleteProperty,
} from '@/lib/api-client';
import { FaEye, FaEyeSlash, FaStar, FaRegStar, FaTrash, FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface PropertyActionsProps {
  property: PropertyWithRelations;
  onUpdate?: () => void;
}

export default function PropertyActions({ property, onUpdate }: PropertyActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleTogglePublished = async () => {
    try {
      setLoading('published');
      const result = await togglePropertyPublished(property.id);
      toast.success(
        result.published
          ? 'Propiedad publicada exitosamente'
          : 'Propiedad despublicada exitosamente'
      );
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el estado de publicación');
    } finally {
      setLoading(null);
    }
  };

  const handleToggleFeatured = async () => {
    try {
      setLoading('featured');
      const result = await togglePropertyFeatured(property.id);
      toast.success(
        result.featured
          ? 'Propiedad marcada como destacada'
          : 'Propiedad desmarcada como destacada'
      );
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el estado destacado');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${property.title}"?`)) {
      return;
    }

    try {
      setLoading('delete');
      await deleteProperty(property.id);
      toast.success('Propiedad eliminada exitosamente');
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la propiedad');
    } finally {
      setLoading(null);
    }
  };

  const handleEdit = () => {
    // Redirect to property detail view (edit route doesn't exist yet)
    router.push(`/propiedades/${property.id}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTogglePublished}
        disabled={loading === 'published'}
        className={`p-2 rounded-lg transition-colors ${
          property.published
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={property.published ? 'Despublicar' : 'Publicar'}
      >
        {property.published ? <FaEye /> : <FaEyeSlash />}
      </button>

      <button
        onClick={handleToggleFeatured}
        disabled={loading === 'featured'}
        className={`p-2 rounded-lg transition-colors ${
          property.featured
            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={property.featured ? 'Quitar destacado' : 'Destacar'}
      >
        {property.featured ? <FaStar /> : <FaRegStar />}
      </button>

      <button
        onClick={handleEdit}
        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        title="Editar"
      >
        <FaEdit />
      </button>

      <button
        onClick={handleDelete}
        disabled={loading === 'delete'}
        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Eliminar"
      >
        <FaTrash />
      </button>
    </div>
  );
}