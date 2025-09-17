import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">AguaZarca</h3>
            <p className="text-gray-400">
              Tu inmobiliaria de confianza en Argentina. Encuentra la propiedad de tus sueños.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/propiedades" className="text-gray-400 hover:text-white transition-colors">
                  Propiedades
                </Link>
              </li>
              <li>
                <Link href="/venta" className="text-gray-400 hover:text-white transition-colors">
                  En Venta
                </Link>
              </li>
              <li>
                <Link href="/alquiler" className="text-gray-400 hover:text-white transition-colors">
                  Alquileres
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <FaPhone className="mr-2" />
                <a href="tel:+541234567890" className="hover:text-white transition-colors">
                  +54 123 456-7890
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <FaEnvelope className="mr-2" />
                <a href="mailto:info@aguazarca.com.ar" className="hover:text-white transition-colors">
                  info@aguazarca.com.ar
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <FaWhatsapp className="mr-2" />
                <a
                  href="https://wa.me/541234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/aguazarca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://instagram.com/aguazarca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {currentYear} AguaZarca. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;