'use client';

import { useState } from 'react';
import { FaLink, FaListAlt, FaSpinner, FaCheck, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';

interface MercadoLibreImportProps {
  onImport: (data: any) => void;
}

export default function MercadoLibreImport({ onImport }: MercadoLibreImportProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'id' | 'bulk'>('url');
  const [url, setUrl] = useState('');
  const [itemId, setItemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulkItems, setBulkItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Import from URL
  const handleUrlImport = async () => {
    if (!url) {
      toast.error('Por favor ingresa una URL válida');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/mercadolibre/import/url', { url });

      if (response.data.success) {
        onImport(response.data.data);
        toast.success('Propiedad importada correctamente');
        setUrl('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al importar desde MercadoLibre');
    } finally {
      setLoading(false);
    }
  };

  // Import from Item ID
  const handleIdImport = async () => {
    if (!itemId) {
      toast.error('Por favor ingresa un ID válido');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/mercadolibre/import/item', { itemId });

      if (response.data.success) {
        onImport(response.data.data);
        toast.success('Propiedad importada correctamente');
        setItemId('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al importar desde MercadoLibre');
    } finally {
      setLoading(false);
    }
  };

  // Load user listings for bulk import
  const loadUserListings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/mercadolibre/listings');

      if (response.data.success) {
        setBulkItems(response.data.data);
        if (response.data.data.length === 0) {
          toast.info('No se encontraron publicaciones en tu cuenta');
        }
      }
    } catch (error: any) {
      toast.error('Error al cargar publicaciones. ¿Está conectada tu cuenta?');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    if (selectedItems.length === 0) {
      toast.error('Por favor selecciona al menos una publicación');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/mercadolibre/import/bulk', {
        itemIds: selectedItems
      });

      if (response.data.success) {
        toast.success(`${response.data.data.imported} propiedades importadas correctamente`);
        setBulkItems([]);
        setSelectedItems([]);
      }
    } catch (error: any) {
      toast.error('Error al importar publicaciones');
    } finally {
      setLoading(false);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'url'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaLink className="inline mr-2" />
          Desde URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('id')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'id'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaShoppingCart className="inline mr-2" />
          Desde ID
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('bulk');
            if (bulkItems.length === 0) loadUserListings();
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'bulk'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaListAlt className="inline mr-2" />
          Importación Masiva
        </button>
      </div>

      {/* Import from URL */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Pega la URL de la publicación de MercadoLibre que quieres importar
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://inmuebles.mercadolibre.com.ar/..."
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleUrlImport}
              disabled={loading || !url}
              className="btn-primary px-6 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Importando...
                </>
              ) : (
                'Importar'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Import from Item ID */}
      {activeTab === 'id' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Ingresa el ID de la publicación (ej: MLA123456789)
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="MLA123456789"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleIdImport}
              disabled={loading || !itemId}
              className="btn-primary px-6 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Importando...
                </>
              ) : (
                'Importar'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Import */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Selecciona las publicaciones que deseas importar
            </p>
            <button
              type="button"
              onClick={loadUserListings}
              disabled={loading}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <FaSpinner className={loading ? 'animate-spin' : ''} />
              Recargar
            </button>
          </div>

          {loading && bulkItems.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-3xl text-gray-400" />
            </div>
          ) : bulkItems.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="w-10 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === bulkItems.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(bulkItems.map(item => item.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left px-3 py-2 text-sm font-medium">Título</th>
                      <th className="text-left px-3 py-2 text-sm font-medium">Precio</th>
                      <th className="text-center px-3 py-2 text-sm font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bulkItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm">{item.title}</td>
                        <td className="px-3 py-2 text-sm">
                          {item.currency} {item.price.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                              <FaCheck /> Activa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                              <FaTimes /> Pausada
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} de {bulkItems.length} seleccionadas
                </span>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={loading || selectedItems.length === 0}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      Importar Seleccionadas ({selectedItems.length})
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaShoppingCart className="text-5xl mx-auto mb-3 opacity-20" />
              <p>No hay publicaciones disponibles</p>
              <p className="text-sm mt-2">
                Conecta tu cuenta de MercadoLibre para ver tus publicaciones
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}