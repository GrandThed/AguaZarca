'use client';

import { useState } from 'react';
import { getMyInquiryData, requestInquiryDeletion } from '@/lib/api-client';
import { Inquiry } from '@/types/api';
import { FaDownload, FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function DataRequest() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState<Inquiry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'data' | 'deletion'>('email');

  const handleViewData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    try {
      setLoading(true);
      const userData = await getMyInquiryData(email);
      setData(userData);
      setStep('data');
      toast.success('Datos encontrados');
    } catch (error: any) {
      toast.error(error.message || 'Error al obtener los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!window.confirm('¿Estás seguro de que deseas solicitar la eliminación de tus datos? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      await requestInquiryDeletion(email);
      setStep('deletion');
      toast.success('Solicitud de eliminación enviada');
    } catch (error: any) {
      toast.error(error.message || 'Error al solicitar la eliminación');
    } finally {
      setLoading(false);
    }
  };

  const downloadData = () => {
    if (!data) return;

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-datos-${email.replace('@', '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (step === 'deletion') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-green-600 mb-4">
            <FaTrash className="mx-auto h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Solicitud Enviada
          </h2>
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace de eliminación a tu email. 
            Haz clic en el enlace para confirmar la eliminación de tus datos.
          </p>
          <p className="text-sm text-gray-500">
            El enlace expirará en 24 horas por motivos de seguridad.
          </p>
          <button
            onClick={() => {
              setStep('email');
              setEmail('');
              setData(null);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Gestión de Datos Personales (GDPR)
      </h2>

      {step === 'email' && (
        <div>
          <p className="text-gray-600 mb-6">
            Según el Reglamento General de Protección de Datos (GDPR), tienes derecho a:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Ver todos los datos personales que tenemos sobre ti</li>
            <li>Solicitar la eliminación de tus datos personales</li>
            <li>Recibir una copia de tus datos en formato legible</li>
          </ul>

          <form onSubmit={handleViewData} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu dirección de email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Ingresa el email que usaste para contactarnos
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Buscando...'
              ) : (
                <>
                  <FaEye />
                  Ver mis datos
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {step === 'data' && data && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Tus Datos Personales
            </h3>
            <div className="flex gap-2">
              <button
                onClick={downloadData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FaDownload />
                Descargar
              </button>
              <button
                onClick={handleRequestDeletion}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <FaTrash />
                {loading ? 'Procesando...' : 'Solicitar eliminación'}
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {email}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Total de consultas:</strong> {data.length}
            </p>
          </div>

          {data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No encontramos datos asociados a este email.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Consultas realizadas:</h4>
              {data.map((inquiry, index) => (
                <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Fecha:</strong> {new Date(inquiry.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    <div>
                      <strong>Nombre:</strong> {inquiry.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {inquiry.email}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {inquiry.phone || 'No proporcionado'}
                    </div>
                    {inquiry.property && (
                      <div className="col-span-2">
                        <strong>Propiedad:</strong> {inquiry.property.title}
                      </div>
                    )}
                    <div className="col-span-2">
                      <strong>Mensaje:</strong>
                      <p className="mt-1 text-gray-600">{inquiry.message}</p>
                    </div>
                    <div>
                      <strong>Estado:</strong> {inquiry.read ? 'Leída' : 'No leída'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep('email')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Volver
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <h4 className="font-semibold mb-2">Información importante:</h4>
        <ul className="space-y-1">
          <li>• La eliminación de datos es permanente e irreversible</li>
          <li>• Recibirás un email de confirmación antes de la eliminación</li>
          <li>• Algunos datos pueden conservarse por requisitos legales</li>
          <li>• El proceso puede tardar hasta 30 días en completarse</li>
        </ul>
      </div>
    </div>
  );
}