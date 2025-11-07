import Link from 'next/link';
import { Metadata } from 'next';
import BackButton from '@/components/ui/BackButton';

export const metadata: Metadata = {
  title: 'Página no encontrada - AguaZarca',
  description: 'La página que buscas no existe o ha sido movida.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center px-4">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-2">404</div>

          {/* House icon to match real estate theme */}
          <div className="flex justify-center mb-4">
            <svg
              className="w-24 h-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Lo sentimos, la página que estás buscando no existe o ha sido movida a otra ubicación.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Volver al inicio
          </Link>

          <div className="flex gap-3">
            <Link
              href="/propiedades?commercialStatus=sale"
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Ver Ventas
            </Link>

            <Link
              href="/propiedades?commercialStatus=annual"
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Ver Alquileres
            </Link>
          </div>

          <BackButton />
        </div>

        {/* Help section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            ¿Necesitas ayuda?
          </p>

          <div className="flex justify-center gap-6 text-sm">
            <Link
              href="/contacto"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Contacto
            </Link>

            <Link
              href="/buscar"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Buscar propiedades
            </Link>

            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>

        {/* Popular searches */}
        <div className="mt-8 text-left">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Búsquedas populares:
          </h3>

          <div className="flex flex-wrap gap-2">
            {[
              'Departamentos en Villa Carlos Paz',
              'Casas en venta',
              'Alquiler temporario',
              'Propiedades con pileta',
              'Terrenos'
            ].map((search) => (
              <Link
                key={search}
                href={`/buscar?q=${encodeURIComponent(search)}`}
                className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}