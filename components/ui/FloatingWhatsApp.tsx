'use client';

import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { X, MessageCircle } from 'lucide-react';
import { useBusinessContact } from '@/hooks/useBusinessContact';
import { generateWhatsAppLink } from '@/lib/utils';

export default function FloatingWhatsApp() {
  const { contact, loading } = useBusinessContact();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpenWhatsApp = () => {
    if (!contact?.whatsapp) return;

    const message = `¡Hola! 👋

Me gustaría recibir información sobre las propiedades disponibles.

¿Podrían ayudarme?

Gracias!`;

    const whatsappUrl = generateWhatsAppLink(contact.whatsapp, message);
    window.open(whatsappUrl, '_blank');
  };

  if (loading || !contact?.whatsapp) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="mb-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <FaWhatsapp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {contact.businessName || 'AguaZarca'}
                </h3>
                <p className="text-sm text-gray-500">¡Hola! ¿Cómo podemos ayudarte?</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>En línea ahora</span>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full bg-green-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Iniciar conversación
            </button>

            <div className="text-xs text-gray-500 text-center">
              Te responderemos en minutos
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center hover:scale-110"
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <FaWhatsapp className="h-8 w-8" />
        )}
      </button>

      {!isExpanded && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
}