export interface PropertyImage {
  id: string;
  url: string;
  order: number;
}

export interface PropertyAttribute {
  id: string;
  name: string;
  value: boolean;
  category: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  commercialStatus: 'sale' | 'annual' | 'temporary';
  price: number;
  currency: string;
  coveredArea?: number;
  totalArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  stories?: number;
  yearBuilt?: number;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  videoId?: string;
  mercadolibreId?: string;
  mercadolibreUrl?: string;
  featured: boolean;
  rentalFeatured: boolean;
  slider: boolean;
  published: boolean;
  images: PropertyImage[];
  attributes: PropertyAttribute[];
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  published: boolean;
  tags?: string[];
  viewCount: number;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
  property?: Property;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Departamento' },
  { value: 'house', label: 'Casa' },
  { value: 'office', label: 'Oficina' },
  { value: 'land', label: 'Terreno' },
  { value: 'warehouse', label: 'Depósito' },
  { value: 'commercial', label: 'Local comercial' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'farm', label: 'Campo' },
  { value: 'country_house', label: 'Casa quinta' },
  { value: 'cabin', label: 'Cabaña' },
  { value: 'garage', label: 'Cochera' },
  { value: 'building', label: 'Edificio' },
  { value: 'ph', label: 'PH' },
  { value: 'duplex', label: 'Dúplex' },
  { value: 'loft', label: 'Loft' },
  { value: 'other', label: 'Otro' }
];

export const COMMERCIAL_STATUS = [
  { value: 'sale', label: 'Venta' },
  { value: 'annual', label: 'Alquiler anual' },
  { value: 'temporary', label: 'Alquiler temporario' }
];