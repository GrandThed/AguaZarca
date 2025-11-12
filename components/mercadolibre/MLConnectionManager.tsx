'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaExternalLinkAlt, FaUnlink, FaSync, FaShoppingCart } from 'react-icons/fa';
import {
  getMercadoLibreStatus,
  getMercadoLibreAuthUrl,
  disconnectMercadoLibre
} from '@/lib/api-client';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface MLConnectionStatus {
  connected: boolean;
  userInfo?: {
    id: number;
    nickname: string;
    email: string;
    points: number;
    siteId: string;
  };
  permissions?: string[];
  expiresAt?: string;
  lastSync?: string;
}

interface MLConnectionManagerProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function MLConnectionManager({ onConnectionChange }: MLConnectionManagerProps) {
  const [status, setStatus] = useState<MLConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const data = await getMercadoLibreStatus();
      setStatus(data);
      onConnectionChange?.(data.connected);
    } catch (error) {
      console.error('Error checking ML status:', error);
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { authUrl } = await getMercadoLibreAuthUrl();

      // Open OAuth window pointing to our callback route
      const callbackUrl = `${window.location.origin}/mercadolibre/callback`;
      const fullAuthUrl = authUrl.includes('redirect_uri')
        ? authUrl
        : `${authUrl}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

      const authWindow = window.open(
        fullAuthUrl,
        'ml-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for message from callback page
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'ML_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          setConnecting(false);
          toast.success('Conectado exitosamente a MercadoLibre');
          checkConnectionStatus();
        }
      };

      window.addEventListener('message', handleMessage);

      // Also check if window was closed
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setConnecting(false);
          // Check connection status after window closes
          setTimeout(() => {
            checkConnectionStatus();
          }, 1000);
        }
      }, 1000);

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setConnecting(false);
      }, 300000);
    } catch (error: any) {
      toast.error('Error al iniciar conexión con MercadoLibre');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de desconectar tu cuenta de MercadoLibre?')) {
      return;
    }

    setLoading(true);
    try {
      await disconnectMercadoLibre();
      setStatus({ connected: false });
      onConnectionChange?.(false);
      toast.success('Cuenta desconectada exitosamente');
    } catch (error: any) {
      toast.error('Error al desconectar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/mercadolibre/sync');
      const result = response.data.success ? response.data.data : response.data;
      toast.success(`Sincronización completada. ${result.updated || 0} propiedades actualizadas`);
      await checkConnectionStatus();
    } catch (error: any) {
      toast.error('Error durante la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-3xl text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaShoppingCart className="text-3xl text-yellow-500" />
        <div>
          <h2 className="text-xl font-semibold">MercadoLibre Integration</h2>
          <p className="text-gray-600 text-sm">
            Conecta tu cuenta para importar publicaciones automáticamente
          </p>
        </div>
      </div>

      {!status.connected ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaTimes className="text-yellow-600 mt-1" />
              <div>
                <h3 className="font-medium text-yellow-800">No Conectado</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Conecta tu cuenta de MercadoLibre para acceder a funciones avanzadas como
                  importación masiva y sincronización automática.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Beneficios de conectar tu cuenta:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Importación masiva de todas tus publicaciones</li>
              <li>Sincronización automática de precios y disponibilidad</li>
              <li>Historial de importaciones</li>
              <li>Actualización automática de estado de propiedades</li>
            </ul>
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <FaSpinner className="animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <FaExternalLinkAlt />
                Conectar con MercadoLibre
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaCheck className="text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-medium text-green-800">Conectado Exitosamente</h3>
                <p className="text-green-700 text-sm mt-1">
                  Tu cuenta está conectada y sincronizada
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          {status.userInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Información de la Cuenta</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Usuario:</span>
                  <p className="font-medium">{status.userInfo.nickname}</p>
                </div>
                <div>
                  <span className="text-gray-600">ID:</span>
                  <p className="font-medium">{status.userInfo.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{status.userInfo.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Puntos:</span>
                  <p className="font-medium">{status.userInfo.points.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Permissions */}
          {status.permissions && status.permissions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Permisos Otorgados</h4>
              <div className="flex flex-wrap gap-2">
                {status.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sync Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Sincronización</h4>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <FaSync className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
              </button>
            </div>

            {status.lastSync && (
              <p className="text-sm text-gray-600">
                Última sincronización: {new Date(status.lastSync).toLocaleString()}
              </p>
            )}

            {status.expiresAt && (
              <p className="text-sm text-gray-600">
                La conexión expira: {new Date(status.expiresAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-primary flex items-center gap-2"
            >
              <FaSync className={syncing ? 'animate-spin' : ''} />
              Sincronizar
            </button>

            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <FaUnlink />
              Desconectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}