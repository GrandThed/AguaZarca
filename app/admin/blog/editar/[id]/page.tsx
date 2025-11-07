'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlogEditor from '@/components/blog/BlogEditor';
import { getBlogPost } from '@/lib/api-client';
import { BlogPost } from '@/types/api';

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params.id as string;
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const blogData = await getBlogPost(blogId);
        setBlog(blogData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error al cargar el blog: {error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">Blog no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <BlogEditor
      initialTitle={blog.title}
      initialSlug={blog.slug}
      initialContent={blog.content}
      initialExcerpt={blog.excerpt || ''}
      initialTags={blog.tags?.map(tag => tag.name) || []}
      initialFeaturedImage={blog.featuredImage || ''}
      initialPublished={blog.published}
      blogId={blog.id}
      isEditing={true}
    />
  );
}