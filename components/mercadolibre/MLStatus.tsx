'use client';

import { useState, useEffect } from 'react';
import { MercadoLibreStatus } from '@/types/api';
import { getMercadoLibreStatus, getMercadoLibreAuthUrl, disconnectMercadoLibre } from '@/lib/api-client';
import { FaLink, FaUnlink, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface MLStatusProps {
  onStatusChange?: () => void;
}

export default function MLStatus({ onStatusChange }: MLStatusProps) {
  const [status, setStatus] = useState<MercadoLibreStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getMercadoLibreStatus();
      setStatus(data);
    } catch (error: any) {
      // Silently handle errors - 401 is expected when not authenticated
      // Only set status, don't log to console
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const { authUrl } = await getMercadoLibreAuthUrl();

      // Open OAuth window pointing to our callback route
      const callbackUrl = `${window.location.origin}/admin/mercadolibre/callback`;
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
          fetchStatus();
          if (onStatusChange) onStatusChange();
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
            fetchStatus();
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
      toast.error(error.message || 'Error al conectar con MercadoLibre');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('¿Estás seguro de desconectar MercadoLibre?')) {
      return;
    }

    try {
      await disconnectMercadoLibre();
      setStatus({ connected: false });
      toast.success('Desconectado de MercadoLibre');
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      toast.error(error.message || 'Error al desconectar');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const isExpired = status?.expiresAt && new Date(status.expiresAt) < new Date();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Estado de MercadoLibre</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          status?.connected && !isExpired
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {status?.connected && !isExpired ? (
            <>
              <FaCheckCircle />
              Conectado
            </>
          ) : (
            <>
              <FaExclamationTriangle />
              {isExpired ? 'Expirado' : 'Desconectado'}
            </>
          )}
        </div>
      </div>

      {status?.connected && status.userInfo && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Información de la cuenta</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>ID:</strong> {status.userInfo.id}</p>
            <p><strong>Usuario:</strong> {status.userInfo.nickname}</p>
            <p><strong>Email:</strong> {status.userInfo.email}</p>
            {status.expiresAt && (
              <p><strong>Expira:</strong> {new Date(status.expiresAt).toLocaleString('es-ES')}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {status?.connected && !isExpired ? (
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaUnlink />
            Desconectar
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FaLink />
            {connecting ? 'Conectando...' : 'Conectar con MercadoLibre'}
          </button>
        )}

        <button
          onClick={fetchStatus}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Actualizar Estado
        </button>
      </div>

      {!status?.connected && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Conecta tu cuenta de MercadoLibre para importar propiedades automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}