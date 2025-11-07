import api from './api';
import {
  ApiResponse,
  PaginatedResponse,
  PropertyWithRelations,
  PropertyFilters,
  CreatePropertyInput,
  UpdatePropertyInput,
  BlogPost,
  BlogFilters,
  CreateBlogInput,
  UpdateBlogInput,
  Inquiry,
  InquiryFilters,
  CreateInquiryInput,
  InquiryStatistics,
  PropertyStatistics,
  AuthResponse,
  User,
  MercadoLibreStatus,
  MercadoLibreListing,
  GlobalSearchResult,
  SavedSearch,
  ImageUploadResponse,
  BlogCategory,
  BlogTag,
  PropertyImage,
} from '@/types/api';

// Helper function to handle API responses
async function handleApiResponse<T>(promise: Promise<any>): Promise<T> {
  try {
    const response = await promise;
    // Handle wrapped responses (with success field)
    if (response.data.hasOwnProperty('success')) {
      if (response.data.success) {
        return response.data.data as T;
      }
      throw new Error(response.data.error || response.data.message || 'API request failed');
    }
    // Handle direct responses (pagination, data, etc.)
    return response.data as T;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || error.response.data.message || 'API request failed');
    }
    throw error;
  }
}

// ============================================
// Authentication APIs
// ============================================

export async function setupInitialAdmin(data: {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
}): Promise<AuthResponse> {
  return handleApiResponse(api.post('/auth/setup', data));
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return handleApiResponse(api.post('/auth/login', { email, password }));
}

export async function register(data: {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
}): Promise<AuthResponse> {
  return handleApiResponse(api.post('/auth/register', data));
}

export async function refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  return handleApiResponse(api.post('/auth/refresh', { refreshToken }));
}

export async function getProfile(): Promise<{ user: User }> {
  return handleApiResponse(api.get('/auth/profile'));
}

export async function getBusinessContact(): Promise<{ businessName: string; whatsapp: string | null; email: string }> {
  return handleApiResponse(api.get('/auth/business-contact'));
}

// ============================================
// Settings APIs

export async function getPublicSettings(category?: string): Promise<Record<string, any>> {
  const params = category ? { category } : {};
  return handleApiResponse(api.get('/settings/public', { params }));
}

export async function getAllSettings(category?: string): Promise<any[]> {
  const params = category ? { category } : {};
  return handleApiResponse(api.get('/settings', { params }));
}

export async function getSetting(key: string): Promise<any> {
  return handleApiResponse(api.get(`/settings/${key}`));
}

export async function createSetting(data: {
  key: string;
  value: string;
  type?: string;
  category?: string;
  description?: string;
  isPublic?: boolean;
}): Promise<any> {
  return handleApiResponse(api.post('/settings', data));
}

export async function updateSetting(key: string, data: {
  value: string;
  type?: string;
  category?: string;
  description?: string;
  isPublic?: boolean;
}): Promise<any> {
  return handleApiResponse(api.put(`/settings/${key}`, data));
}

export async function deleteSetting(key: string): Promise<void> {
  return handleApiResponse(api.delete(`/settings/${key}`));
}

export async function bulkUpdateSettings(settings: Array<{ key: string; value: string }>): Promise<any[]> {
  return handleApiResponse(api.put('/settings/bulk/update', { settings }));
}

export async function initializeDefaultSettings(): Promise<any[]> {
  return handleApiResponse(api.post('/settings/initialize'));
}

export async function logout(): Promise<void> {
  return handleApiResponse(api.post('/auth/logout'));
}

// ============================================
// Property APIs
// ============================================

export async function getProperties(
  filters?: PropertyFilters
): Promise<PaginatedResponse<PropertyWithRelations>> {
  const params = filters ? Object.fromEntries(
    Object.entries({
      ...filters,
      page: filters.page?.toString(),
      limit: filters.limit?.toString(),
      priceMin: filters.priceMin?.toString(),
      priceMax: filters.priceMax?.toString(),
      bedrooms: filters.bedrooms?.toString(),
      bathrooms: filters.bathrooms?.toString(),
      featured: filters.featured?.toString(),
      published: filters.published?.toString(),
    }).filter(([key, value]) => value !== undefined && value !== 'undefined')
  ) : undefined;

  return handleApiResponse(api.get('/properties', { params }));
}

export async function getProperty(id: number): Promise<PropertyWithRelations> {
  return handleApiResponse(api.get(`/properties/${id}`));
}

export async function createProperty(data: CreatePropertyInput): Promise<PropertyWithRelations> {
  return handleApiResponse(api.post('/properties', data));
}

export async function updateProperty(
  id: number,
  data: UpdatePropertyInput
): Promise<PropertyWithRelations> {
  return handleApiResponse(api.put(`/properties/${id}`, data));
}

export async function deleteProperty(id: number): Promise<void> {
  return handleApiResponse(api.delete(`/properties/${id}`));
}

export async function togglePropertyPublished(
  id: number
): Promise<{ id: number; published: boolean }> {
  return handleApiResponse(api.patch(`/properties/${id}/toggle-published`));
}

export async function togglePropertyFeatured(
  id: number
): Promise<{ id: number; featured: boolean }> {
  return handleApiResponse(api.patch(`/properties/${id}/toggle-featured`));
}

export async function getSliderProperties(): Promise<PropertyWithRelations[]> {
  return handleApiResponse(api.get('/properties/slider'));
}

export async function getFeaturedProperties(): Promise<PropertyWithRelations[]> {
  return handleApiResponse(api.get('/properties/featured'));
}

export async function getRentalFeaturedProperties(): Promise<PropertyWithRelations[]> {
  return handleApiResponse(api.get('/properties/rental-featured'));
}

export async function getPropertyStatistics(): Promise<PropertyStatistics> {
  return handleApiResponse(api.get('/properties/statistics'));
}

// Bulk property operations
export async function bulkUpdatePublished(propertyIds: number[], published: boolean): Promise<{ updated: number; published: boolean }> {
  return handleApiResponse(api.post('/properties/bulk/publish', { propertyIds, published }));
}

export async function bulkUpdateFeatured(propertyIds: number[], featured: boolean): Promise<{ updated: number; featured: boolean }> {
  return handleApiResponse(api.post('/properties/bulk/feature', { propertyIds, featured }));
}

export async function bulkDeleteProperties(propertyIds: number[]): Promise<{ deleted: number }> {
  return handleApiResponse(api.post('/properties/bulk/delete', { propertyIds }));
}

// ============================================
// Image Management APIs
// ============================================

export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  return handleApiResponse(
    api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
}

export async function uploadMultipleImages(files: File[]): Promise<ImageUploadResponse[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  return handleApiResponse(
    api.post('/images/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
}

export async function deleteImage(id: number): Promise<void> {
  return handleApiResponse(api.delete(`/images/${id}`));
}

export async function reorderPropertyImages(
  propertyId: number,
  imageIds: number[]
): Promise<void> {
  return handleApiResponse(
    api.put(`/images/property/${propertyId}/reorder`, { imageIds })
  );
}

export async function getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
  return handleApiResponse(api.get(`/images/property/${propertyId}`));
}

export async function validateImageUrl(url: string): Promise<{
  valid: boolean;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
}> {
  return handleApiResponse(api.post('/images/validate-url', { url }));
}

// ============================================
// Blog APIs
// ============================================

export async function getBlogPosts(
  filters?: BlogFilters
): Promise<PaginatedResponse<BlogPost>> {
  const params = filters ? {
    ...filters,
    page: filters.page?.toString(),
    limit: filters.limit?.toString(),
    published: filters.published?.toString(),
  } : undefined;

  return handleApiResponse(api.get('/blog/posts', { params }));
}

export async function getBlogPost(slugOrId: string): Promise<BlogPost> {
  return handleApiResponse(api.get(`/blog/posts/${slugOrId}`));
}

export async function getBlogPostById(id: string): Promise<BlogPost> {
  return handleApiResponse(api.get(`/blog/posts/${id}`));
}

export async function createBlogPost(data: CreateBlogInput): Promise<BlogPost> {
  return handleApiResponse(api.post('/blog/posts', data));
}

export async function updateBlogPost(id: string, data: UpdateBlogInput): Promise<BlogPost> {
  return handleApiResponse(api.put(`/blog/posts/${id}`, data));
}

export async function deleteBlogPost(id: string): Promise<void> {
  return handleApiResponse(api.delete(`/blog/posts/${id}`));
}

export async function toggleBlogPublished(id: string): Promise<BlogPost> {
  return handleApiResponse(api.patch(`/blog/posts/${id}/toggle-published`));
}

export async function searchBlogPosts(
  query: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<BlogPost>> {
  return handleApiResponse(
    api.get('/blog/posts/search', {
      params: { q: query, page: page.toString(), limit: limit.toString() },
    })
  );
}

export async function getRelatedPosts(slug: string): Promise<BlogPost[]> {
  return handleApiResponse(api.get(`/blog/posts/${slug}/related`));
}

export async function toggleBlogPostPublished(
  id: string
): Promise<{ id: string; published: boolean }> {
  return handleApiResponse(api.patch(`/blog/posts/${id}/toggle-published`));
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return handleApiResponse(api.get('/blog/categories'));
}

export async function getBlogTags(): Promise<BlogTag[]> {
  return handleApiResponse(api.get('/blog/tags'));
}

// ============================================
// Search APIs
// ============================================

export async function globalSearch(
  query: string,
  page = 1,
  limit = 20
): Promise<GlobalSearchResult> {
  return handleApiResponse(
    api.get('/search/global', {
      params: { q: query, page: page.toString(), limit: limit.toString() },
    })
  );
}

export async function searchProperties(
  params: PropertyFilters & { q?: string }
): Promise<PaginatedResponse<PropertyWithRelations>> {
  const searchParams = {
    ...params,
    page: params.page?.toString(),
    limit: params.limit?.toString(),
    priceMin: params.priceMin?.toString(),
    priceMax: params.priceMax?.toString(),
    bedrooms: params.bedrooms?.toString(),
    bathrooms: params.bathrooms?.toString(),
    featured: params.featured?.toString(),
    published: params.published?.toString(),
  };

  return handleApiResponse(api.get('/search/properties', { params: searchParams }));
}

export async function getSearchSuggestions(
  query: string,
  type?: 'property' | 'blog'
): Promise<string[]> {
  return handleApiResponse(
    api.get('/search/suggestions', {
      params: { q: query, ...(type && { type }) },
    })
  );
}

export async function getPopularSearches(
  type?: 'property' | 'blog',
  limit = 10
): Promise<string[]> {
  return handleApiResponse(
    api.get('/search/popular', {
      params: { ...(type && { type }), limit: limit.toString() },
    })
  );
}

export async function saveSearch(data: {
  name: string;
  query?: string;
  filters: Record<string, any>;
  searchType?: string;
  alertsEnabled?: boolean;
}): Promise<SavedSearch> {
  return handleApiResponse(api.post('/search/saved', data));
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  return handleApiResponse(api.get('/search/saved'));
}

export async function deleteSavedSearch(id: string): Promise<void> {
  return handleApiResponse(api.delete(`/search/saved/${id}`));
}

export async function getSearchHistory(): Promise<any[]> {
  return handleApiResponse(api.get('/search/history'));
}

export async function clearSearchHistory(): Promise<void> {
  return handleApiResponse(api.delete('/search/history'));
}

// ============================================
// Inquiry APIs
// ============================================

export async function createInquiry(data: CreateInquiryInput): Promise<{ id: string; message: string }> {
  return handleApiResponse(api.post('/inquiries', data));
}

export async function getMyInquiries(
  filters?: InquiryFilters
): Promise<PaginatedResponse<Inquiry>> {
  const params = filters ? {
    ...filters,
    page: filters.page?.toString(),
    limit: filters.limit?.toString(),
    read: filters.read?.toString(),
    propertyId: filters.propertyId?.toString(),
  } : undefined;

  return handleApiResponse(api.get('/inquiries/my-inquiries', { params }));
}

export async function getPropertyInquiries(propertyId: string | number): Promise<Inquiry[]> {
  return handleApiResponse(api.get(`/inquiries/property/${propertyId}`));
}

export async function markInquiryAsRead(inquiryId: string): Promise<void> {
  return handleApiResponse(api.patch(`/inquiries/${inquiryId}/read`));
}

export async function markMultipleInquiriesAsRead(inquiryIds: string[]): Promise<void> {
  return handleApiResponse(api.patch('/inquiries/mark-read', { inquiryIds }));
}

export async function replyToInquiry(inquiryId: string, message: string): Promise<void> {
  return handleApiResponse(api.post(`/inquiries/${inquiryId}/reply`, { message }));
}

export async function getInquiryStatistics(): Promise<InquiryStatistics> {
  return handleApiResponse(api.get('/inquiries/statistics'));
}

export async function deleteInquiry(inquiryId: string): Promise<void> {
  return handleApiResponse(api.delete(`/inquiries/${inquiryId}`));
}

export async function exportInquiries(): Promise<Blob> {
  const response = await api.get('/inquiries/export', { responseType: 'blob' });
  return response.data;
}

// GDPR
export async function requestInquiryDeletion(email: string): Promise<void> {
  return handleApiResponse(api.post('/inquiries/request-deletion', { email }));
}

export async function deleteInquiriesWithToken(token: string): Promise<void> {
  return handleApiResponse(api.post('/inquiries/delete-with-token', { token }));
}

export async function getMyInquiryData(email: string): Promise<Inquiry[]> {
  return handleApiResponse(api.get('/inquiries/my-data', { params: { email } }));
}

// ============================================
// MercadoLibre APIs
// ============================================

export async function getMercadoLibreAuthUrl(): Promise<{ authUrl: string }> {
  return handleApiResponse(api.get('/mercadolibre/auth-url'));
}

export async function handleMercadoLibreCallback(code: string, state?: string): Promise<any> {
  return handleApiResponse(
    api.get('/mercadolibre/callback', {
      params: { code, ...(state && { state }) },
    })
  );
}

export async function getMercadoLibreStatus(): Promise<MercadoLibreStatus> {
  return handleApiResponse(api.get('/mercadolibre/status'));
}

export async function disconnectMercadoLibre(): Promise<void> {
  return handleApiResponse(api.post('/mercadolibre/disconnect'));
}

export async function getMercadoLibreListings(
  status?: 'active' | 'paused' | 'closed',
  offset = 0,
  limit = 20
): Promise<MercadoLibreListing[]> {
  return handleApiResponse(
    api.get('/mercadolibre/listings', {
      params: {
        ...(status && { status }),
        offset: offset.toString(),
        limit: limit.toString(),
      },
    })
  );
}

export async function getMercadoLibreItem(itemId: string): Promise<any> {
  return handleApiResponse(api.get(`/mercadolibre/items/${itemId}`));
}

export async function importFromMercadoLibre(itemId: string): Promise<PropertyWithRelations> {
  return handleApiResponse(api.post(`/mercadolibre/import/${itemId}`));
}

export async function refreshMercadoLibreToken(): Promise<void> {
  return handleApiResponse(api.post('/mercadolibre/refresh'));
}