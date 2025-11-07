'use client';

import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { bulkUpdatePublished, bulkUpdateFeatured, bulkDeleteProperties } from '@/lib/api-client';
import { toast } from 'react-toastify';

interface BulkActionsDropdownProps {
  selectedIds: number[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsDropdown({
  selectedIds,
  onActionComplete,
  onClearSelection,
}: BulkActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBulkPublish = async () => {
    if (isProcessing) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea publicar ${selectedIds.length} propiedad(es)?`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await bulkUpdatePublished(selectedIds, true);
      toast.success(`${result.updated} propiedades publicadas exitosamente`);
      onClearSelection();
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || 'Error al publicar propiedades');
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (isProcessing) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea despublicar ${selectedIds.length} propiedad(es)?`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await bulkUpdatePublished(selectedIds, false);
      toast.success(`${result.updated} propiedades despublicadas exitosamente`);
      onClearSelection();
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || 'Error al despublicar propiedades');
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  const handleBulkFeature = async () => {
    if (isProcessing) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea destacar ${selectedIds.length} propiedad(es)?`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await bulkUpdateFeatured(selectedIds, true);
      toast.success(`${result.updated} propiedades destacadas exitosamente`);
      onClearSelection();
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || 'Error al destacar propiedades');
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  const handleBulkUnfeature = async () => {
    if (isProcessing) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea quitar el destacado de ${selectedIds.length} propiedad(es)?`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await bulkUpdateFeatured(selectedIds, false);
      toast.success(`${result.updated} propiedades quitadas de destacadas exitosamente`);
      onClearSelection();
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || 'Error al quitar destacado de propiedades');
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (isProcessing) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar ${selectedIds.length} propiedad(es)? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await bulkDeleteProperties(selectedIds);
      toast.success(`${result.deleted} propiedades eliminadas exitosamente`);
      onClearSelection();
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar propiedades');
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Procesando...' : 'Acciones en lote'}
        <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={handleBulkPublish}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Publicar seleccionadas
            </button>
            <button
              onClick={handleBulkUnpublish}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Despublicar seleccionadas
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={handleBulkFeature}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Destacar seleccionadas
            </button>
            <button
              onClick={handleBulkUnfeature}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Quitar destacado
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={handleBulkDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Eliminar seleccionadas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}