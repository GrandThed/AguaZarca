// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  phoneNumber?: string | null;
  role: string;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Property Types
export interface PropertyWithRelations {
  id: number;
  title: string;
  description: string;
  type: string;
  comercialStatus: 'Venta' | 'Alquiler anual' | 'Alquiler temporal';
  priceValue: number | null;
  priceCurrency: string;
  featured: boolean;
  rentalFeatured: boolean;
  slider: boolean;
  published: boolean;
  revisorMessage: string | null;
  videoId: string | null;
  views: number;
  addressLine: string;
  neighborhood: string | null;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  mlId: string | null;
  mlLink: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
  images: PropertyImage[];
  characteristics: PropertyCharacteristic[];
  attributes: PropertyAttribute[];
}

export interface PropertyImage {
  id: number;
  url: string;
  thumbnailUrl?: string;
  order: number;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
}

export interface PropertyCharacteristic {
  id: string;
  name: string;
  value: string;
}

export interface PropertyAttribute {
  id: string;
  name: string;
  value: boolean;
}

export interface PropertyImageInput {
  filename?: string;
  thumbnailFilename?: string;
  originalName?: string;
  url: string;
  thumbnailUrl?: string;
  size?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  order?: number;
}

export interface PropertyCharacteristicInput {
  name: string;
  value: string | number;
}

export interface PropertyAttributeInput {
  name: string;
  value: boolean;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  type: string;
  comercialStatus: string;
  priceValue?: number;
  priceCurrency?: string;
  featured?: boolean;
  rentalFeatured?: boolean;
  slider?: boolean;
  published?: boolean;
  addressLine: string;
  neighborhood?: string;
  city: string;
  state?: string;
  country?: string;
  videoId?: string;
  mlId?: string;
  mlLink?: string;
  images?: PropertyImageInput[];
  characteristics?: PropertyCharacteristicInput[];
  attributes?: PropertyAttributeInput[];
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  type?: string;
  comercialStatus?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  featured?: boolean;
  published?: boolean;
  sort?: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | 'featured';
  search?: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  published: boolean;
  views: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  author?: {
    id: string;
    displayName: string | null;
    email: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface CreateBlogInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  published?: boolean;
  categories?: string[];
  tags?: string[];
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {}

export interface BlogFilters {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  published?: boolean;
}

// Inquiry Types
export interface Inquiry {
  id: string;
  propertyId: number | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  property?: {
    id: number;
    title: string;
    user: {
      id: string;
      email: string;
      displayName: string | null;
    };
  };
}

export interface CreateInquiryInput {
  propertyId?: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface InquiryFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  propertyId?: number;
}

export interface InquiryStatistics {
  total: number;
  unread: number;
  readRate: string;
  today: number;
  week: number;
  month: number;
  topProperties: Array<{
    propertyId: number;
    title: string;
    count: number;
  }>;
  topUsers: Array<{
    email: string;
    name: string;
    count: number;
  }>;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// MercadoLibre Types
export interface MercadoLibreStatus {
  connected: boolean;
  expiresAt?: string;
  userInfo?: {
    id: number;
    nickname: string;
    email: string;
    points: number;
    siteId: string;
  };
  permissions?: string[];
  lastSync?: string;
}

export interface MercadoLibreListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  thumbnail: string;
  permalink: string;
  status: string;
  address?: {
    city: string;
    state: string;
  };
}

// Search Types
export interface GlobalSearchResult {
  properties: PropertyWithRelations[];
  blogs: BlogPost[];
  total: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query?: string;
  filters: Record<string, any>;
  searchType?: string;
  alertsEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Image Types
export interface ImageUploadResponse {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
}

// Property Statistics
export interface PropertyStatistics {
  totalProperties: number;
  publishedProperties: number;
  unpublishedProperties: number;
  featuredProperties: number;
  totalViews: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}