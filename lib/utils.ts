import { Property } from '../types/property';

export function formatPrice(price: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'ARS' ? 'ARS' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(price);
}

export function formatArea(area: number): string {
  return `${area} m²`;
}

export function formatDate(date: string): string {
  const formatter = new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return formatter.format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function getPropertyTypeLabel(type: string): string {
  const types: Record<string, string> = {
    apartment: 'Departamento',
    house: 'Casa',
    office: 'Oficina',
    land: 'Terreno',
    warehouse: 'Depósito',
    commercial: 'Local comercial',
    hotel: 'Hotel',
    farm: 'Campo',
    country_house: 'Casa quinta',
    cabin: 'Cabaña',
    garage: 'Cochera',
    building: 'Edificio',
    ph: 'PH',
    duplex: 'Dúplex',
    loft: 'Loft',
    other: 'Otro',
  };

  return types[type] || type;
}

export function getCommercialStatusLabel(status: string): string {
  const statuses: Record<string, string> = {
    sale: 'Venta',
    annual: 'Alquiler anual',
    temporary: 'Alquiler temporario',
  };

  return statuses[status] || status;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function getPropertyShareMessage(property: Property, template: string = ''): string {
  const defaultTemplate = 'Hola! Me interesa la propiedad {title} en {location}. Link: {url}';
  const messageTemplate = template || defaultTemplate;

  const location = [property.neighborhood, property.city].filter(Boolean).join(', ');
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/propiedades/${property.id}`;

  return messageTemplate
    .replace('{title}', property.title)
    .replace('{location}', location)
    .replace('{price}', formatPrice(property.price, property.currency))
    .replace('{url}', url)
    .replace('{type}', getPropertyTypeLabel(property.type))
    .replace('{status}', getCommercialStatusLabel(property.commercialStatus));
}