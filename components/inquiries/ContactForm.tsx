'use client';

import { useState } from 'react';
import { createInquiry } from '@/lib/api-client';
import { CreateInquiryInput } from '@/types/api';
import { toast } from 'react-toastify';
import { FaEnvelope, FaUser, FaPhone, FaComment } from 'react-icons/fa';

interface ContactFormProps {
  propertyId?: number;
  propertyTitle?: string;
  onSuccess?: () => void;
}

export default function ContactForm({ propertyId, propertyTitle, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState<CreateInquiryInput>({
    propertyId,
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await createInquiry({
        ...formData,
        propertyId: propertyId,
      });
      setSubmitted(true);
      toast.success('Consulta enviada exitosamente');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar la consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateInquiryInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 mb-4">
          <FaEnvelope className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          ¡Consulta enviada!
        </h3>
        <p className="text-green-700">
          Gracias por tu interés. Te contactaremos pronto.
        </p>
        {propertyTitle && (
          <p className="text-sm text-green-600 mt-2">
            Propiedad: {propertyTitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {propertyId ? 'Consultar sobre esta propiedad' : 'Contactanos'}
      </h3>
      
      {propertyTitle && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Propiedad:</strong> {propertyTitle}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaUser className="inline mr-2" />
            Nombre completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tu nombre completo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaEnvelope className="inline mr-2" />
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaPhone className="inline mr-2" />
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+54 9 11 1234-5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaComment className="inline mr-2" />
            Mensaje *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={propertyId 
              ? 'Me interesa esta propiedad. ¿Podrían darme más información?'
              : 'Escribe tu consulta aquí...'
            }
            required
          />
        </div>

        <div className="text-xs text-gray-500">
          * Campos requeridos
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar Consulta'}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        Al enviar este formulario, aceptas que podamos contactarte para responder tu consulta.
        Respetamos tu privacidad y no compartiremos tu información con terceros.
      </div>
    </div>
  );
}