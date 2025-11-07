'use client';

import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { useBusinessContact } from '@/hooks/useBusinessContact';

export default function ContactoPage() {
  const { contact, loading } = useBusinessContact();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contacto</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Ponte en contacto con nosotros
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Estamos aquí para ayudarte a encontrar la propiedad perfecta.
                No dudes en contactarnos por cualquier consulta.
              </p>
            </div>

            {/* WhatsApp Primary Contact */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white mb-8">
              <div className="flex items-center gap-4 mb-4">
                <FaWhatsapp className="w-10 h-10" />
                <div>
                  <h3 className="text-xl font-bold">¡Hablemos por WhatsApp!</h3>
                  <p className="text-green-100">La forma más rápida de contactarnos</p>
                </div>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="text-center text-green-100">
                    Cargando información de contacto...
                  </div>
                ) : contact?.whatsapp ? (
                  <>
                    <a
                      href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=¡Hola! Me gustaría recibir información sobre propiedades disponibles. ¿Podrían ayudarme?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-white text-green-600 font-semibold py-3 px-6 rounded-lg hover:bg-green-50 transition-colors text-center"
                    >
                      📱 Abrir WhatsApp Web
                    </a>
                    <a
                      href={`whatsapp://send?phone=${contact.whatsapp.replace(/\D/g, '')}&text=¡Hola! Me gustaría recibir información sobre propiedades disponibles. ¿Podrían ayudarme?`}
                      className="block w-full border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors text-center"
                    >
                      📲 Abrir WhatsApp App
                    </a>
                  </>
                ) : (
                  <div className="text-center text-green-100">
                    WhatsApp no disponible temporalmente
                  </div>
                )}
              </div>

              <div className="text-center text-green-100 text-sm mt-4 space-y-1">
                <p>⚡ Respuesta inmediata</p>
                <p>🕐 Lun-Vie 9-18h • Sáb 9-13h</p>
                {contact?.whatsapp && <p>📞 {contact.whatsapp}</p>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaPhone className="w-6 h-6 text-blue-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Teléfono</h3>
                  <a href="tel:+541112345678" className="text-blue-600 hover:text-blue-800 transition-colors">
                    +54 11 1234-5678
                  </a>
                  <p className="text-sm text-gray-500">Llamadas directas</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaEnvelope className="w-6 h-6 text-blue-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                  <a href={`mailto:${contact?.email || 'contacto@aguazarca.com.ar'}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                    {contact?.email || 'contacto@aguazarca.com.ar'}
                  </a>
                  <p className="text-sm text-gray-500">Respuesta en 24-48hs</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaMapMarkerAlt className="w-6 h-6 text-red-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Ubicación</h3>
                  <p className="text-gray-600">
                    Buenos Aires, Argentina
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Horarios de Atención</h3>
              <div className="text-blue-800 space-y-1">
                <p>Lunes a Viernes: 9:00 - 18:00</p>
                <p>Sábados: 9:00 - 13:00</p>
                <p>Domingos: Cerrado</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Envíanos un mensaje
            </h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto *
                </label>
                <select
                  id="asunto"
                  name="asunto"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="compra">Consulta de compra</option>
                  <option value="venta">Consulta de venta</option>
                  <option value="alquiler">Consulta de alquiler</option>
                  <option value="tasacion">Tasación</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={5}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}