'use client';

import { useState } from 'react';
import MLConnectionManager from '@/components/mercadolibre/MLConnectionManager';
import ImportHistory from '@/components/mercadolibre/ImportHistory';
import { FaLink, FaHistory } from 'react-icons/fa';

export default function MercadoLibreAdminPage() {
  const [activeTab, setActiveTab] = useState<'connection' | 'history'>('connection');
  const [connected, setConnected] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integración MercadoLibre</h1>
        <p className="text-gray-600">
          Gestiona la conexión con MercadoLibre e importa propiedades automáticamente
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('connection')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'connection'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaLink className="inline mr-2" />
          Conexión
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaHistory className="inline mr-2" />
          Historial de Importaciones
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'connection' && (
        <MLConnectionManager onConnectionChange={setConnected} />
      )}

      {activeTab === 'history' && (
        <ImportHistory />
      )}
    </div>
  );
}