export enum PropertyType {
  CASA = 'Casa',
  DEPARTAMENTO = 'Departamento',
  PH = 'PH',
  OFICINA = 'Oficina',
  LOCAL = 'Local',
  TERRENO = 'Terreno',
  GALPON = 'Galpón',
  COCHERA = 'Cochera',
  QUINTA = 'Quinta',
  CAMPO = 'Campo',
  HOTEL = 'Hotel',
  EDIFICIO = 'Edificio',
  COUNTRY = 'Country',
  DEPOSITO = 'Depósito',
  FONDO_COMERCIO = 'Fondo de comercio',
  CABANA = 'Cabaña',
  OTRO = 'Otro'
}

export enum CommercialStatus {
  SALE = 'Venta',
  ANNUAL_RENT = 'Alquiler',
  TEMPORARY_RENT = 'Alquiler temporal'
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PAUSED = 'PAUSED',
  SOLD = 'SOLD',
  RENTED = 'RENTED'
}

export interface PropertyImage {
  id: number;
  url: string;
  order: number;
}

export interface PropertyAttribute {
  id: string;
  name: string;
  value: boolean;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  type: string;
  comercialStatus: 'Venta' | 'Alquiler anual' | 'Alquiler temporal';
  priceValue: number | null;
  priceCurrency: string;
  coveredArea?: number;
  totalArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  stories?: number;
  yearBuilt?: number;
  address?: string;
  neighborhood?: string | null;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  videoId?: string | null;
  mercadolibreId?: string;
  mercadolibreUrl?: string;
  featured: boolean;
  rentalFeatured: boolean;
  slider: boolean;
  published: boolean;
  views?: number;
  revisorMessage?: string | null;
  images: PropertyImage[];
  attributes: PropertyAttribute[];
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  role?: string;
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