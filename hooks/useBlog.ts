import { useState, useEffect, useCallback } from 'react';
import {
  BlogPost,
  BlogFilters,
  PaginatedResponse,
  BlogCategory,
  BlogTag,
} from '@/types/api';
import {
  getBlogPosts,
  searchBlogPosts,
  getBlogCategories,
  getBlogTags,
  getRelatedPosts,
} from '@/lib/api-client';

export function useBlogPosts(initialFilters?: BlogFilters) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BlogFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBlogPosts(filters);
      setPosts(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateFilters = (newFilters: Partial<BlogFilters>) => {
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
    fetchPosts();
  };

  return {
    posts,
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

export function useBlogSearch() {
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const search = async (query: string, page = 1, limit = 10) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await searchBlogPosts(query, page, limit);
      setResults(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to search blog posts');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    pagination,
    search,
  };
}

export function useBlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBlogCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useBlogTags() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBlogTags();
        setTags(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tags');
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, loading, error };
}

export function useRelatedPosts(slug: string) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getRelatedPosts(slug);
        setPosts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch related posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [slug]);

  return { posts, loading, error };
}