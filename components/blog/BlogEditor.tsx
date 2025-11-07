'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createBlogPost, updateBlogPost, getBlogPost } from '@/lib/api-client';
import { CreateBlogInput, UpdateBlogInput, BlogPost } from '@/types/api';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface BlogEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
  initialTags?: string[];
  initialFeaturedImage?: string;
  initialPublished?: boolean;
  blogId?: string;
  isEditing?: boolean;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const BlogEditor: React.FC<BlogEditorProps> = ({
  initialContent = '',
  initialTitle = '',
  initialSlug = '',
  initialExcerpt = '',
  initialTags = [],
  initialFeaturedImage = '',
  initialPublished = false,
  blogId,
  isEditing = false,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  // State management
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [featuredImage, setFeaturedImage] = useState(initialFeaturedImage);
  const [published, setPublished] = useState(initialPublished);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Refs
  const quillRef = useRef<any>(null);

  // Generate slug when title changes
  useEffect(() => {
    if (title && !isEditing) {
      const newSlug = createSlug(title);
      setSlug(newSlug);
    }
  }, [title, isEditing]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Image upload handler (placeholder - would need to implement actual upload)
  const imageHandler = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        toast.loading('Subiendo imagen...', { id: 'image-upload' });

        // TODO: Implement actual image upload to your storage service
        // const imageUrl = await uploadImage(file);

        // For now, create a local URL (this is temporary)
        const imageUrl = URL.createObjectURL(file);

        // Insert image into editor
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();
        if (quill && range) {
          quill.insertEmbed(range.index, 'image', imageUrl);
          quill.setSelection(range.index + 1);
        }

        toast.success('Imagen subida correctamente', { id: 'image-upload' });
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Error al subir imagen', { id: 'image-upload' });
      }
    };
  }, []);

  // Quill modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  // Quill formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video'
  ];

  // Save function
  const handleSave = async (forceDraft = false) => {
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!content.trim()) {
      toast.error('El contenido es obligatorio');
      return;
    }

    if (!user) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      setIsSaving(true);

      const shouldPublish = forceDraft ? false : published;

      const blogData = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt || generateExcerpt(content),
        featuredImage: featuredImage || undefined,
        published: shouldPublish,
        categories: [], // Add category support later
        tags,
      };

      if (isEditing && blogId) {
        await updateBlogPost(blogId, blogData as UpdateBlogInput);
        toast.success(shouldPublish ? 'Blog actualizado y publicado' : 'Blog guardado como borrador');
      } else {
        const newBlog = await createBlogPost(blogData as CreateBlogInput);
        toast.success(shouldPublish ? 'Blog creado y publicado' : 'Blog guardado como borrador');
        router.push(`/blog/${newBlog.slug}`);
      }

    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate excerpt from content
  const generateExcerpt = (htmlContent: string) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    return textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
  };

  // Handle tag input
  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const newTag = target.value.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        target.value = '';
      }
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
              </h1>
              <p className="text-gray-600">
                {isEditing
                  ? 'Modifica tu artículo y comparte actualizaciones'
                  : 'Comparte tu conocimiento con la comunidad'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Guardar Borrador
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : (published ? 'Publicar' : 'Guardar Borrador')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título del artículo
              </label>
              <input
                id="title"
                type="text"
                placeholder="Escribe un título atractivo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
              <div className="text-sm text-gray-500 mt-1">{title.length}/100</div>
            </div>

            {/* Slug */}
            <div className="bg-white rounded-lg shadow p-6">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                URL del artículo
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                  aguazarca.com.ar/blog/
                </span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(createSlug(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="url-del-articulo"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido del artículo
              </label>
              <div style={{ height: '500px' }}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Escribe el contenido de tu artículo aquí..."
                  style={{ height: '400px' }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Publicación</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={published}
                    onChange={() => setPublished(true)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Publicar ahora</div>
                    <div className="text-sm text-gray-500">Visible para todos inmediatamente</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={!published}
                    onChange={() => setPublished(false)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Borrador</div>
                    <div className="text-sm text-gray-500">Guarda sin publicar</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen Destacada</h3>
              {featuredImage ? (
                <div className="relative">
                  <img src={featuredImage} alt="Imagen destacada" className="w-full rounded-lg" />
                  <button
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-400 mb-2">📷</div>
                  <input
                    type="url"
                    placeholder="URL de la imagen destacada"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Extracto</h3>
              <textarea
                placeholder="Breve descripción del artículo..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={160}
                rows={4}
              />
              <div className="text-sm text-gray-500 mt-1">{excerpt.length}/160</div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Etiquetas</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Escribe una etiqueta y presiona Enter..."
                onKeyDown={handleTagsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;