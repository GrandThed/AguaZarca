import { useState, useEffect, useCallback } from 'react';
import {
  PropertyWithRelations,
  PropertyFilters,
  PaginatedResponse,
} from '@/types/api';
import {
  getProperties,
  getFeaturedProperties,
  getSliderProperties,
  getRentalFeaturedProperties,
} from '@/lib/api-client';

export function useProperties(initialFilters?: PropertyFilters) {
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProperties(filters);
      setProperties(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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
    fetchProperties();
  };

  return {
    properties,
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

export function useFeaturedProperties() {
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFeaturedProperties();
        setProperties(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch featured properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { properties, loading, error };
}

export function useSliderProperties() {
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlider = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSliderProperties();
        setProperties(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch slider properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlider();
  }, []);

  return { properties, loading, error };
}

export function useRentalFeaturedProperties() {
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRentalFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRentalFeaturedProperties();
        setProperties(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch rental featured properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalFeatured();
  }, []);

  return { properties, loading, error };
}