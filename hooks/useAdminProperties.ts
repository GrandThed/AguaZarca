import { useState, useEffect, useCallback } from 'react';
import {
  PropertyWithRelations,
  PropertyFilters,
  PaginatedResponse,
} from '@/types/api';
import api from '@/lib/api';

export function useAdminProperties(initialFilters?: Partial<PropertyFilters>) {
  const [allProperties, setAllProperties] = useState<PropertyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const fetchAllProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both published and unpublished properties
      const [publishedResponse, unpublishedResponse] = await Promise.all([
        api.get('/properties', {
          params: { ...filters, published: true, limit: 100 }
        }),
        api.get('/properties', {
          params: { ...filters, published: false, limit: 100 }
        })
      ]);

      const publishedData = publishedResponse.data.data?.data || [];
      const unpublishedData = unpublishedResponse.data.data?.data || [];

      // Combine both arrays
      const combined = [...publishedData, ...unpublishedData];

      // Apply pagination manually
      const startIndex = ((filters.page || 1) - 1) * (filters.limit || 20);
      const endIndex = startIndex + (filters.limit || 20);
      const paginatedProperties = combined.slice(startIndex, endIndex);

      setAllProperties(paginatedProperties);
      setPagination({
        total: combined.length,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(combined.length / (filters.limit || 20)),
      });
    } catch (err: any) {
      console.error('Error fetching admin properties:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch properties');
      setAllProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAllProperties();
  }, [fetchAllProperties]);

  const updateFilters = (newFilters: Partial<PropertyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1);
    }
  };

  const refetch = () => {
    fetchAllProperties();
  };

  return {
    properties: allProperties,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    nextPage,
    prevPage,
    refetch,
  };
}