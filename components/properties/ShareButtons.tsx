'use client';

import React from 'react';
import { Property } from '@/types/property';
import { PropertyWithRelations } from '@/types/api';
import { formatPrice, getPropertyTypeLabel, getCommercialStatusLabel } from '@/lib/utils';
import { Facebook, Twitter, Linkedin, Mail, Link2, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useBusinessContact } from '@/hooks/useBusinessContact';

interface ShareButtonsProps {
  property: Property | PropertyWithRelations;
}

export default function ShareButtons({ property }: ShareButtonsProps) {
  const { contact, loading } = useBusinessContact();
  const propertyUrl = typeof window !== 'undefined' ? window.location.href : '';
  const title = property.title;
  const description = `${getPropertyTypeLabel(property.type)} en ${getCommercialStatusLabel(property.comercialStatus)} - ${formatPrice(property.priceValue || 0, property.priceCurrency)}`;

  const location = [property.neighborhood, property.city].filter(Boolean).join(', ');
  const whatsappMessage = `¡Mira esta propiedad!\n\n*${title}*\n${description}\n📍 ${location}\n\n${propertyUrl}`;

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(propertyUrl)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${propertyUrl}`)}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl);
    // TODO: Add toast notification
  };

  const handleWhatsAppAgent = () => {
    if (!contact?.whatsapp) {
      console.error('No WhatsApp number available');
      return;
    }

    const message = `Hola! Estoy interesado en la propiedad:\n\n*${title}*\n${description}\n📍 ${location}\n\nID: ${property.id}\n\n${propertyUrl}`;
    const cleanPhone = contact.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Social Share Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          aria-label="Compartir en WhatsApp"
        >
          <FaWhatsapp className="h-5 w-5" />
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Compartir en Facebook"
        >
          <Facebook className="h-5 w-5" />
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          aria-label="Compartir en Twitter"
        >
          <Twitter className="h-5 w-5" />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          aria-label="Compartir en LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a
          href={shareLinks.email}
          className="flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Compartir por correo"
        >
          <Mail className="h-5 w-5" />
        </a>
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          aria-label="Copiar enlace"
        >
          <Link2 className="h-5 w-5" />
        </button>
      </div>

      {/* WhatsApp Direct Contact Button */}
      <button
        onClick={handleWhatsAppAgent}
        disabled={loading || !contact?.whatsapp}
        className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageCircle className="h-5 w-5" />
        <span>{loading ? 'Cargando...' : 'Consultar por WhatsApp'}</span>
      </button>
    </div>
  );
}