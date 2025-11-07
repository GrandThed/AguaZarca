'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { FaGripVertical, FaTrash } from 'react-icons/fa';

interface SimpleImageReorderProps {
  images: string[];
  onReorder: (images: string[]) => void;
  onDelete?: (index: number) => void;
}

export default function SimpleImageReorder({
  images,
  onReorder,
  onDelete
}: SimpleImageReorderProps) {
  const [localImages, setLocalImages] = useState<string[]>(images);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalImages(items);
    onReorder(items);
  };

  const handleDelete = (index: number) => {
    if (onDelete) {
      onDelete(index);
    }
  };

  if (localImages.length === 0) {
    return null;
  }

  return (
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
              <Draggable key={`image-${index}`} draggableId={`image-${index}`} index={index}>
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
                        src={image}
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
                    </div>

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
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
  );
}