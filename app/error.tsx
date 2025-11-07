'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Error icon */}
        <div className="mb-8">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Ups! Algo salió mal
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Ocurrió un error inesperado. Esto puede ser temporal, por favor intenta nuevamente.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-gray-100 p-4 rounded-lg mb-6">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Detalles del error (desarrollo)
              </summary>
              <code className="text-sm text-red-600 break-all">
                {error.message}
              </code>
            </details>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Intentar nuevamente
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Volver al inicio
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm underline"
          >
            Recargar página
          </button>
        </div>

        {/* Help section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Si el problema persiste, contáctanos
          </p>

          <div className="flex justify-center gap-6 text-sm">
            <Link
              href="/contacto"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Soporte
            </Link>

            <a
              href="mailto:info@aguazarca.com.ar"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}