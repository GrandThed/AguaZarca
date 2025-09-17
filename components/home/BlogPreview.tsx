import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/property';
import { formatDate } from '@/lib/utils';

async function getRecentBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog?published=true&limit=3`);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

const BlogPreview: React.FC = async () => {
  const posts = await getRecentBlogPosts();

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Últimas Noticias</h2>
          <p className="text-gray-600">Mantente informado sobre el mercado inmobiliario</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              {post.featuredImage && (
                <div className="relative h-48">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <time>{formatDate(post.createdAt)}</time>
                  {post.tags && post.tags.length > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{post.tags[0]}</span>
                    </>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  Leer más →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver Todos los Artículos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;