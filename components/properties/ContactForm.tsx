'use client';

import React, { useState } from 'react';
import { Send, MessageCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { createInquiry } from '@/lib/api-client';
import { generateWhatsAppLink } from '@/lib/utils';
import { useBusinessContact } from '@/hooks/useBusinessContact';

interface ContactFormProps {
  propertyId: string;
  propertyTitle: string;
}

export default function ContactForm({ propertyId, propertyTitle }: ContactFormProps) {
  const { contact, loading } = useBusinessContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hola, estoy interesado en la propiedad "${propertyTitle}". Me gustaría obtener más información.`,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWhatsApp = () => {
    if (!contact?.whatsapp) {
      console.error('No WhatsApp number available');
      return;
    }

    const message = `¡Hola! 👋

Estoy interesado en esta propiedad:
📍 *${propertyTitle}*

ID: ${propertyId}
🔗 ${window.location.href}

¿Podrían darme más información? Me gustaría coordinar una visita.

¡Gracias!`;

    const whatsappUrl = generateWhatsAppLink(contact.whatsapp, message);
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await createInquiry({
        ...formData,
        propertyId: parseInt(propertyId),
      });

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: `Hola, estoy interesado en la propiedad "${propertyTitle}". Me gustaría obtener más información.`,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* WhatsApp Primary CTA */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaWhatsapp className="h-8 w-8" />
            <div>
              <h3 className="font-bold text-lg">¡Consultá por WhatsApp!</h3>
              <p className="text-green-100 text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Respuesta inmediata
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleWhatsApp}
          disabled={loading || !contact?.whatsapp}
          className="w-full bg-white text-green-600 font-semibold py-3 px-6 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageCircle className="h-5 w-5" />
          {loading ? 'Cargando...' : 'Hablar ahora por WhatsApp'}
        </button>

        <p className="text-center text-green-100 text-xs mt-3">
          Te respondemos al instante • Coordinamos visitas • Sin formularios
        </p>
      </div>

      {/* Alternative Contact Options */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full px-4 py-3 flex items-center justify-between text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium">Otras opciones de contacto</span>
          {showForm ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showForm && (
          <div className="px-4 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Escriba su mensaje aquí..."
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                  ¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  Hubo un error al enviar el mensaje. Por favor, intente nuevamente.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}