'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaSync, FaTimes, FaSpinner, FaClock, FaShoppingCart } from 'react-icons/fa';
import api from '@/lib/api';

interface SyncStatus {
  status: 'synced' | 'out_of_sync' | 'syncing' | 'error' | 'not_ml_property';
  lastSync?: string;
  mlItemId?: string;
  differences?: {
    price?: { local: number; ml: number };
    title?: { local: string; ml: string };
    status?: { local: string; ml: string };
  };
}

interface SyncStatusIndicatorProps {
  propertyId: number;
  mlItemId?: string;
  compact?: boolean;
  showDetails?: boolean;
  onSync?: () => void;
}

export default function SyncStatusIndicator({
  propertyId,
  mlItemId,
  compact = false,
  showDetails = true,
  onSync
}: SyncStatusIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'not_ml_property' });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (mlItemId) {
      checkSyncStatus();
    } else {
      setLoading(false);
    }
  }, [propertyId, mlItemId]);

  const checkSyncStatus = async () => {
    if (!mlItemId) return;

    try {
      const response = await api.get(`/mercadolibre/sync-status/${propertyId}`);

      if (response.data.success) {
        setSyncStatus(response.data.data);
      }
    } catch (error) {
      setSyncStatus({ status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!mlItemId || syncing) return;

    setSyncing(true);
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

    try {
      const response = await api.post(`/mercadolibre/sync-item/${mlItemId}`);

      if (response.data.success) {
        setSyncStatus({ status: 'synced', lastSync: new Date().toISOString() });
        onSync?.();
      } else {
        setSyncStatus({ status: 'error' });
      }
    } catch (error) {
      setSyncStatus({ status: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'synced':
        return <FaCheck className="text-green-500" />;
      case 'out_of_sync':
        return <FaSync className="text-orange-500" />;
      case 'syncing':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'error':
        return <FaTimes className="text-red-500" />;
      case 'not_ml_property':
        return null;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus.status) {
      case 'synced':
        return 'Sincronizado';
      case 'out_of_sync':
        return 'Desactualizado';
      case 'syncing':
        return 'Sincronizando...';
      case 'error':
        return 'Error de sincronización';
      case 'not_ml_property':
        return null;
      default:
        return 'Estado desconocido';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'synced':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'out_of_sync':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'syncing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <FaSpinner className="animate-spin" />
        {!compact && <span className="text-sm">Verificando...</span>}
      </div>
    );
  }

  if (syncStatus.status === 'not_ml_property') {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <FaShoppingCart className="text-yellow-500 text-sm" />
        {getStatusIcon()}
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaShoppingCart className="text-yellow-500" />
          {getStatusIcon()}
          <span className="font-medium text-sm">{getStatusText()}</span>
        </div>

        {syncStatus.status === 'out_of_sync' && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-sm btn-primary flex items-center gap-1"
          >
            <FaSync className={syncing ? 'animate-spin' : ''} />
            Sincronizar
          </button>
        )}
      </div>

      {showDetails && (
        <>
          {syncStatus.lastSync && (
            <p className="text-xs mt-2 opacity-75">
              Última sincronización: {new Date(syncStatus.lastSync).toLocaleString()}
            </p>
          )}

          {syncStatus.mlItemId && (
            <p className="text-xs mt-1 opacity-75 font-mono">
              ML ID: {syncStatus.mlItemId}
            </p>
          )}

          {/* Show differences */}
          {syncStatus.differences && (
            <div className="mt-3 space-y-2">
              <h4 className="text-xs font-medium">Diferencias detectadas:</h4>

              {syncStatus.differences.price && (
                <div className="text-xs">
                  <span className="font-medium">Precio:</span>
                  <span className="ml-1">
                    Local: ${syncStatus.differences.price.local.toLocaleString()} →
                    ML: ${syncStatus.differences.price.ml.toLocaleString()}
                  </span>
                </div>
              )}

              {syncStatus.differences.title && (
                <div className="text-xs">
                  <span className="font-medium">Título:</span>
                  <div className="ml-1 mt-1">
                    <div>Local: {syncStatus.differences.title.local}</div>
                    <div>ML: {syncStatus.differences.title.ml}</div>
                  </div>
                </div>
              )}

              {syncStatus.differences.status && (
                <div className="text-xs">
                  <span className="font-medium">Estado:</span>
                  <span className="ml-1">
                    Local: {syncStatus.differences.status.local} →
                    ML: {syncStatus.differences.status.ml}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}