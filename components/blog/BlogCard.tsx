'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types/api';
import { FaCalendar, FaEye, FaEdit, FaTrash, FaEyeSlash } from 'react-icons/fa';
import { deleteBlogPost, toggleBlogPostPublished } from '@/lib/api-client';
import { toast } from 'react-toastify';

interface BlogCardProps {
  post: BlogPost;
  adminMode?: boolean;
  onUpdate?: () => void;
}

export default function BlogCard({ post, adminMode = false, onUpdate }: BlogCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleTogglePublished = async () => {
    try {
      setLoading('toggle');
      await toggleBlogPostPublished(post.id);
      toast.success(
        post.published ? 'Artículo despublicado' : 'Artículo publicado'
      );
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el estado');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${post.title}"?`)) {
      return;
    }

    try {
      setLoading('delete');
      await deleteBlogPost(post.id);
      toast.success('Artículo eliminado exitosamente');
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el artículo');
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative h-48">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
          />
          {adminMode && !post.published && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                Borrador
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Categories and Tags */}
        {(post.categories.length > 0 || post.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
              >
                {category.name}
              </span>
            ))}
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded"
              >
                #{tag.name}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded">
                +{post.tags.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {adminMode ? (
            post.title
          ) : (
            <Link
              href={`/blog/${post.slug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {post.title}
            </Link>
          )}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FaCalendar />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <FaEye />
              {post.views} vistas
            </span>
          </div>
          {post.author && (
            <span>Por {post.author.displayName || 'Autor'}</span>
          )}
        </div>

        {/* Admin Actions */}
        {adminMode && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {post.published ? (
                <span className="text-green-600 text-sm">Publicado</span>
              ) : (
                <span className="text-yellow-600 text-sm">Borrador</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePublished}
                disabled={loading === 'toggle'}
                className={`p-2 rounded transition-colors ${
                  post.published
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-gray-600 hover:bg-gray-50'
                } disabled:opacity-50`}
                title={post.published ? 'Despublicar' : 'Publicar'}
              >
                {post.published ? <FaEye /> : <FaEyeSlash />}
              </button>
              <Link
                href={`/admin/blog/editar/${post.id}`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Editar"
              >
                <FaEdit />
              </Link>
              <button
                onClick={handleDelete}
                disabled={loading === 'delete'}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        )}

        {/* Read More Button (Non-admin) */}
        {!adminMode && (
          <Link
            href={`/blog/${post.slug}`}
            className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Leer más
          </Link>
        )}
      </div>
    </article>
  );
}