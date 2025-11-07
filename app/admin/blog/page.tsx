'use client';

import React from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useBlogPosts } from '@/hooks/useBlog';
import { useAuth } from '@/contexts/AuthContext';
import { deleteBlogPost, toggleBlogPublished } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

const BlogAdminPage: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading, error, refetch } = useBlogPosts();

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) {
      return;
    }

    try {
      await deleteBlogPost(id);
      toast.success('Blog eliminado correctamente');
      refetch();
    } catch (error: any) {
      toast.error(`Error al eliminar: ${error.message}`);
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      await toggleBlogPublished(id);
      toast.success(`Blog ${currentStatus ? 'despublicado' : 'publicado'} correctamente`);
      refetch();
    } catch (error: any) {
      toast.error(`Error al cambiar estado: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user?.isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Blog</h1>
          <p className="text-gray-600">Administra todos los artículos del blog</p>
        </div>
        <Link
          href="/admin/blog/crear"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Crear Artículo
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">Error al cargar los artículos: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          <div className="text-sm text-gray-500">
                            {post.excerpt && post.excerpt.length > 60
                              ? `${post.excerpt.substring(0, 60)}...`
                              : post.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <FaEye className="mr-1" />
                          {post.views || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver artículo"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/admin/blog/editar/${post.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar artículo"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleTogglePublished(post.id, post.published)}
                          className={`${
                            post.published ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                          title={post.published ? 'Despublicar' : 'Publicar'}
                        >
                          {post.published ? '📤' : '📥'}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar artículo"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {posts.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No hay artículos creados</div>
              <Link
                href="/admin/blog/crear"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Crear primer artículo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogAdminPage;