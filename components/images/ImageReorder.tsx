'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { PropertyImage } from '@/types/api';
import { FaGripVertical, FaTrash } from 'react-icons/fa';
import { reorderPropertyImages, deleteImage } from '@/lib/api-client';
import { toast } from 'react-toastify';

interface ImageReorderProps {
  propertyId: number;
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
  canDelete?: boolean;
}

export default function ImageReorder({
  propertyId,
  images,
  onImagesChange,
  canDelete = true,
}: ImageReorderProps) {
  const [localImages, setLocalImages] = useState<PropertyImage[]>(images);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    setLocalImages(items);

    // Save new order to backend
    try {
      setIsSaving(true);
      const imageIds = items.map((img) => img.id);
      await reorderPropertyImages(propertyId, imageIds);

      // Update parent component
      const reorderedImages = items.map((img, index) => ({
        ...img,
        order: index,
      }));
      onImagesChange(reorderedImages);

      toast.success('Orden de imágenes actualizado');
    } catch (error: any) {
      // Revert on error
      setLocalImages(images);
      toast.error(error.message || 'Error al reordenar las imágenes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (imageId: number, index: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      return;
    }

    try {
      await deleteImage(imageId);

      const updatedImages = localImages.filter((_, i) => i !== index);
      setLocalImages(updatedImages);
      onImagesChange(updatedImages);

      toast.success('Imagen eliminada exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la imagen');
    }
  };

  if (localImages.length === 0) {
    return (
      <div className="p-8 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">No hay imágenes para ordenar</p>
      </div>
    );
  }

  return (
    <div className={`${isSaving ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ordenar Imágenes</h3>
        <p className="text-sm text-gray-500">
          Arrastra las imágenes para cambiar su orden
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
              }`}
            >
              {localImages.map((image, index) => (
                <Draggable key={image.id} draggableId={String(image.id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${
                        snapshot.isDragging
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                      >
                        <FaGripVertical />
                      </div>

                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={image.thumbnailUrl || image.url}
                          alt={`Imagen ${index + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Imagen {index + 1}
                        </p>
                        {index === 0 && (
                          <p className="text-xs text-blue-600">Imagen principal</p>
                        )}
                        {image.width && image.height && (
                          <p className="text-xs text-gray-500">
                            {image.width} × {image.height}px
                          </p>
                        )}
                        {image.size && (
                          <p className="text-xs text-gray-500">
                            {(image.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(image.id, index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar imagen"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isSaving && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Guardando nuevo orden...
        </div>
      )}
    </div>
  );
}