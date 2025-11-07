import { useState, useEffect, useCallback } from 'react';
import {
  Inquiry,
  InquiryFilters,
  PaginatedResponse,
  InquiryStatistics,
} from '@/types/api';
import {
  getMyInquiries,
  getInquiryStatistics,
  markInquiryAsRead,
  markMultipleInquiriesAsRead,
} from '@/lib/api-client';

export function useInquiries(initialFilters?: InquiryFilters) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InquiryFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyInquiries(filters);
      setInquiries(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inquiries');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateFilters = (newFilters: Partial<InquiryFilters>) => {
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

  const markAsRead = async (inquiryId: string) => {
    try {
      await markInquiryAsRead(inquiryId);
      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry.id === inquiryId ? { ...inquiry, read: true } : inquiry
        )
      );
    } catch (error) {
      console.error('Error marking inquiry as read:', error);
      throw error;
    }
  };

  const markMultipleAsRead = async (inquiryIds: string[]) => {
    try {
      await markMultipleInquiriesAsRead(inquiryIds);
      setInquiries(prev =>
        prev.map(inquiry =>
          inquiryIds.includes(inquiry.id) ? { ...inquiry, read: true } : inquiry
        )
      );
    } catch (error) {
      console.error('Error marking inquiries as read:', error);
      throw error;
    }
  };

  const refetch = () => {
    fetchInquiries();
  };

  return {
    inquiries,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    nextPage,
    prevPage,
    markAsRead,
    markMultipleAsRead,
    refetch,
  };
}

export function useInquiryStatistics() {
  const [statistics, setStatistics] = useState<InquiryStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Check if we have a token before trying to fetch statistics
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setStatistics(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        const data = await getInquiryStatistics();
        setStatistics(data);
      } catch (err: any) {
        // Silently handle errors - don't log to console
        if (err.response?.status === 401) {
          setError('Authentication required');
        } else if (err.response?.status === 500) {
          setError('Statistics service temporarily unavailable');
        } else {
          setError(err.message || 'Failed to fetch statistics');
        }
        setStatistics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInquiryStatistics();
      setStatistics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  return { statistics, loading, error, refetch };
}