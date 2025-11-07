'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaEye, FaSync, FaTrash, FaFilter } from 'react-icons/fa';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface ImportRecord {
  id: number;
  mlItemId: string;
  propertyId?: number;
  status: 'success' | 'failed' | 'pending';
  title: string;
  price: number;
  currency: string;
  importedAt: string;
  lastSyncAt?: string;
  error?: string;
  syncStatus?: 'synced' | 'out_of_sync' | 'error';
}

interface ImportHistoryProps {
  propertyId?: number;
}

export default function ImportHistory({ propertyId }: ImportHistoryProps) {
  const router = useRouter();
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [syncing, setSyncing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadImportHistory();
  }, [page, filter, propertyId]);

  const loadImportHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filter !== 'all' && { status: filter }),
        ...(propertyId && { propertyId: propertyId.toString() })
      });

      const response = await apiClient.get(`/api/mercadolibre/import-history?${params}`);

      if (response.data.success) {
        setImports(response.data.data.imports);
        setTotalPages(response.data.data.totalPages);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Error loading import history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (importId: number, mlItemId: string) => {
    setSyncing(mlItemId);
    try {
      const response = await apiClient.post(`/api/mercadolibre/sync-item/${mlItemId}`);

      if (response.data.success) {
        toast.success('Propiedad sincronizada correctamente');
        loadImportHistory();
      }
    } catch (error: any) {
      toast.error('Error al sincronizar la propiedad');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (importId: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro de importación?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/mercadolibre/import-history/${importId}`);

      if (response.data.success) {
        toast.success('Registro eliminado correctamente');
        loadImportHistory();
      }
    } catch (error: any) {
      toast.error('Error al eliminar el registro');
    }
  };

  const handleViewProperty = (propertyId: number) => {
    router.push(`/propiedades/${propertyId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            <FaCheck /> Exitoso
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            <FaTimes /> Error
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            <FaSpinner className="animate-spin" /> Pendiente
          </span>
        );
      default:
        return null;
    }
  };

  const getSyncStatusBadge = (syncStatus?: string) => {
    switch (syncStatus) {
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            <FaCheck /> Sincronizado
          </span>
        );
      case 'out_of_sync':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            <FaSync /> Desactualizado
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            <FaTimes /> Error Sync
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Historial de Importaciones</h2>
            <p className="text-gray-600 text-sm">
              {total} importaciones registradas
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as any);
                setPage(1);
              }}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">Todos</option>
              <option value="success">Exitosos</option>
              <option value="failed">Con Error</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-gray-400" />
          </div>
        ) : imports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No hay registros de importación</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                  Propiedad
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                  ML ID
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                  Precio
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-900">
                  Estado
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-900">
                  Sincronización
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                  Fecha
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {imports.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-sm truncate max-w-xs">
                        {record.title}
                      </p>
                      {record.error && (
                        <p className="text-red-500 text-xs mt-1 truncate max-w-xs">
                          {record.error}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">
                    {record.mlItemId}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {record.currency} {record.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="space-y-1">
                      {getSyncStatusBadge(record.syncStatus)}
                      {record.lastSyncAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(record.lastSyncAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(record.importedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {record.propertyId && (
                        <button
                          onClick={() => handleViewProperty(record.propertyId!)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver propiedad"
                        >
                          <FaEye />
                        </button>
                      )}

                      {record.status === 'success' && (
                        <button
                          onClick={() => handleSync(record.id, record.mlItemId)}
                          disabled={syncing === record.mlItemId}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="Sincronizar"
                        >
                          <FaSync className={syncing === record.mlItemId ? 'animate-spin' : ''} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar registro"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}