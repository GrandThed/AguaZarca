import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './WhatsAppButton.css';

const WhatsAppButton = ({ propertyTitle, propertyUrl }) => {
  const phoneNumber = '5493517896825';
  
  const message = encodeURIComponent(
    `Hola! Me interesa hacer una consulta sobre esta propiedad: ${propertyTitle}\n\n${propertyUrl}\n\n¡Espero tu respuesta!`
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="whatsapp-float" onClick={handleClick}>
      <FaWhatsapp className="whatsapp-icon" />
      <span className="whatsapp-tooltip">¡Consultanos por WhatsApp!</span>
    </div>
  );
};

export default WhatsAppButton;