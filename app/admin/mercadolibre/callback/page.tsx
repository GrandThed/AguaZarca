'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

export default function MercadoLibreCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = () => {
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        const errorMessages: Record<string, string> = {
          'missing_code': 'No se recibió el código de autorización',
          'invalid_state': 'Estado de seguridad inválido',
          'no_user_context': 'No se pudo identificar el usuario',
          'token_exchange_failed': 'Error al intercambiar el código por tokens',
        };
        setMessage(errorMessages[error] || `Error: ${decodeURIComponent(error)}`);
        return;
      }

      if (success === 'true') {
        setStatus('success');
        setMessage('¡Conexión exitosa con MercadoLibre!');

        // Close this window and notify parent
        setTimeout(() => {
          // If this is a popup, close it
          if (window.opener) {
            window.opener.postMessage({ type: 'ML_AUTH_SUCCESS' }, window.location.origin);
            window.close();
          } else {
            // If not a popup, redirect to the main ML page
            router.push('/admin/mercadolibre');
          }
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Respuesta inesperada del servidor');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <FaSpinner className="text-6xl text-blue-600 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Procesando autorización...
              </h2>
              <p className="text-gray-600">
                Conectando tu cuenta de MercadoLibre
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <FaCheckCircle className="text-6xl text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Conexión exitosa!
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirigiendo...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <FaExclamationTriangle className="text-6xl text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error de conexión
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => {
                  if (window.opener) {
                    window.close();
                  } else {
                    router.push('/admin/mercadolibre');
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Volver a intentar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
