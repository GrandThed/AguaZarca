'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FaSearch, FaTimes, FaCalendar, FaClock, FaEye, FaRegNewspaper } from 'react-icons/fa';
import { useBlogPosts } from '@/hooks/useBlog';
import { formatDate } from '@/lib/utils';

const BlogPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Get filters from URL
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);

  // Get blog posts with current filters
  const { posts, loading, error } = useBlogPosts({
    published: true,
    search: searchTerm,
    tag: selectedTag,
  });

  // Extract unique tags from posts
  const allTags = Array.from(
    new Set(
      posts
        .flatMap(post => post.tags?.map(tag => tag.name) || [])
        .filter(Boolean)
    )
  ).sort();

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useBlogPosts hook will automatically refetch with the new search term
  };

  // Handle tag filter
  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag);
    setSearchTerm('');

    // Update URL
    const url = new URL(window.location.href);
    if (tag) {
      url.searchParams.set('tag', tag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.pushState({}, '', url);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    const url = new URL(window.location.href);
    url.searchParams.delete('tag');
    window.history.pushState({}, '', url);
  };

  // Generate excerpt from content
  const generateExcerpt = (content: string, maxLength = 150) => {
    if (!content) return '';
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Inmobiliario</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Descubre consejos expertos, tendencias del mercado y noticias inmobiliarias
              de Villa Carlos Paz y alrededores
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{posts.length}</div>
                <div className="text-blue-100">Artículos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{allTags.length}</div>
                <div className="text-blue-100">Categorías</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en el blog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTagFilter('')}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedTag === ''
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                  }`}
                >
                  Todas
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(searchTerm || selectedTag) && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Filtros activos:</span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Búsqueda: "{searchTerm}"
                </span>
              )}
              {selectedTag && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Etiqueta: {selectedTag}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">Error al cargar los artículos: {error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-12">
            <FaRegNewspaper className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron artículos</h3>
            <p className="text-gray-600">
              {searchTerm || selectedTag ?
                'Intenta cambiar los filtros de búsqueda.' :
                'Aún no hay artículos publicados.'
              }
            </p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <>
            {/* Featured Article (First Post) */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Artículo Destacado</h2>
              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                <Link href={`/blog/${posts[0].slug}`}>
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      {posts[0].featuredImage ? (
                        <Image
                          src={posts[0].featuredImage}
                          alt={posts[0].title}
                          width={600}
                          height={400}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                          <FaRegNewspaper className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center mb-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          Destacado
                        </span>
                        {posts[0].tags && posts[0].tags.length > 0 && (
                          <span className="ml-2 text-blue-600 text-sm">
                            #{posts[0].tags[0].name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{posts[0].title}</h3>
                      <p className="text-gray-600 mb-4">
                        {posts[0].excerpt || generateExcerpt(posts[0].content, 200)}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <FaCalendar className="mr-1" />
                          {formatDate(posts[0].publishedAt || posts[0].createdAt)}
                        </div>
                        <div className="flex items-center">
                          <FaEye className="mr-1" />
                          {posts[0].views || 0} vistas
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            </div>

            {/* Recent Articles Grid */}
            {posts.length > 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Artículos Recientes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.slice(1).map((post) => (
                    <article key={post.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                      <Link href={`/blog/${post.slug}`}>
                        <div className="relative">
                          {post.featuredImage ? (
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              width={400}
                              height={200}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                              <FaRegNewspaper className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center">
                            <FaClock className="mr-1" />
                            {Math.ceil((post.content?.length || 0) / 200)} min
                          </div>
                        </div>
                        <div className="p-6">
                          {post.tags && post.tags.length > 0 && (
                            <div className="mb-2">
                              {post.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="text-blue-600 text-sm mr-2">
                                  #{tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt || generateExcerpt(post.content)}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaCalendar className="mr-1" />
                              {formatDate(post.publishedAt || post.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <FaEye className="mr-1" />
                              {post.views || 0}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;