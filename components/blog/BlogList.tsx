'use client';

import { BlogPost } from '@/types/api';
import { useBlogPosts } from '@/hooks/useBlog';
import BlogCard from './BlogCard';
import Pagination from '../ui/Pagination';
import BlogFilters from './BlogFilters';
import { useState } from 'react';

interface BlogListProps {
  initialFilters?: any;
  showFilters?: boolean;
  adminMode?: boolean;
}

export default function BlogList({
  initialFilters = {},
  showFilters = true,
  adminMode = false,
}: BlogListProps) {
  const {
    posts,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    refetch,
  } = useBlogPosts(initialFilters);

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <BlogFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={() => updateFilters({})}
        />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {adminMode ? 'Gestionar Blog' : 'Blog'}
        </h2>
        <p className="text-gray-600">
          {pagination.total} {pagination.total === 1 ? 'artículo' : 'artículos'}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron artículos</p>
          {adminMode && (
            <a
              href="/admin/blog/crear"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear primer artículo
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                adminMode={adminMode}
                onUpdate={refetch}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}