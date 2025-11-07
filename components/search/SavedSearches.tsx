'use client';

import { useState, useEffect } from 'react';
import { SavedSearch } from '@/types/api';
import { getSavedSearches, deleteSavedSearch, saveSearch } from '@/lib/api-client';
import { FaSearch, FaTrash, FaBell, FaBellSlash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface SavedSearchesProps {
  onSearchSelect?: (search: SavedSearch) => void;
}

export default function SavedSearches({ onSearchSelect }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    query: '',
    alertsEnabled: false,
  });

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const data = await getSavedSearches();
      setSearches(data);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const newSearch = await saveSearch({
        name: formData.name,
        query: formData.query,
        filters: {}, // This would come from current filters
        alertsEnabled: formData.alertsEnabled,
      });
      setSearches(prev => [...prev, newSearch]);
      setFormData({ name: '', query: '', alertsEnabled: false });
      setShowForm(false);
      toast.success('Búsqueda guardada exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la búsqueda');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta búsqueda guardada?')) {
      return;
    }

    try {
      await deleteSavedSearch(id);
      setSearches(prev => prev.filter(s => s.id !== id));
      toast.success('Búsqueda eliminada');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Búsquedas Guardadas</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
          Nueva
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la búsqueda
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Casas en Córdoba"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consulta de búsqueda
              </label>
              <input
                type="text"
                value={formData.query}
                onChange={(e) => setFormData(prev => ({ ...prev, query: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Términos de búsqueda"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alerts"
                checked={formData.alertsEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, alertsEnabled: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="alerts" className="ml-2 block text-sm text-gray-700">
                Recibir alertas por email de nuevas propiedades
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {searches.length === 0 ? (
        <div className="text-center py-8">
          <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No tienes búsquedas guardadas
          </h4>
          <p className="text-gray-500">
            Guarda tus búsquedas frecuentes para acceder rápidamente a ellas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{search.name}</h4>
                {search.query && (
                  <p className="text-sm text-gray-600 mt-1">
                    Consulta: "{search.query}"
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Creada: {new Date(search.createdAt).toLocaleDateString('es-ES')}</span>
                  <span className="flex items-center gap-1">
                    {search.alertsEnabled ? (
                      <>
                        <FaBell className="text-green-500" />
                        Alertas activas
                      </>
                    ) : (
                      <>
                        <FaBellSlash className="text-gray-400" />
                        Sin alertas
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSearchSelect && onSearchSelect(search)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => handleDelete(search.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}