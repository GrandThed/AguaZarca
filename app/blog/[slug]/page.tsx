'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendar, FaEye, FaArrowLeft, FaEdit, FaTrash, FaShare, FaClock } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogPost, getRelatedPosts, deleteBlogPost } from '@/lib/api-client';
import { BlogPost } from '@/types/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const BlogDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  // Load blog and related posts
  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const blogData = await getBlogPost(slug);
        setBlog(blogData);

        // Load related posts
        try {
          const related = await getRelatedPosts(slug);
          setRelatedPosts(related);
        } catch (relatedError) {
          console.error('Error loading related posts:', relatedError);
          // Don't fail if related posts can't be loaded
        }

      } catch (err: any) {
        console.error('Error loading blog:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBlog();
    }
  }, [slug]);

  // Reading progress tracking
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!blog || !window.confirm(`¿Estás seguro de que quieres eliminar "${blog.title}"?`)) {
      return;
    }

    try {
      await deleteBlogPost(blog.id);
      toast.success('Blog eliminado correctamente');
      router.push('/blog');
    } catch (error: any) {
      toast.error(`Error al eliminar: ${error.message}`);
    }
  };

  // Share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.excerpt || undefined,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  // Generate excerpt from content
  const generateExcerpt = (content: string, maxLength = 150) => {
    if (!content) return '';
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar el blog</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  // Blog not found
  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog no encontrado</h2>
          <p className="text-gray-600 mb-6">El artículo que buscas no existe o ha sido eliminado.</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="mr-2" />
              Volver al blog
            </Link>

            {user?.isAdmin && (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/blog/editar/${blog.id}`}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Editar artículo"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-600 hover:text-red-600"
                  title="Eliminar artículo"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-green-600"
                  title="Compartir artículo"
                >
                  <FaShare />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="mb-8">
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              width={800}
              height={400}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Title and Meta */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaCalendar className="mr-1" />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </div>
              <div className="flex items-center">
                <FaClock className="mr-1" />
                {calculateReadingTime(blog.content)} min de lectura
              </div>
              <div className="flex items-center">
                <FaEye className="mr-1" />
                {blog.views || 0} vistas
              </div>
            </div>

            {!user?.isAdmin && (
              <button
                onClick={handleShare}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <FaShare className="mr-1" />
                Compartir
              </button>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                  className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm hover:bg-blue-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div
            className="prose prose-lg max-w-none prose-blue"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Artículos relacionados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  {relatedPost.featuredImage && (
                    <Image
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      width={400}
                      height={200}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedPost.excerpt || generateExcerpt(relatedPost.content)}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                      <span>{calculateReadingTime(relatedPost.content)} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default BlogDetailPage;