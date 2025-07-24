import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { uploadBlogImage, deleteBlogImage } from '../../utils/blogImageUpload';
import { slugify } from '../../utils/slugify';
import './blogEditor.css';

const BlogEditor = ({ 
  initialContent = '', 
  initialTitle = '', 
  initialSlug = '',
  blogId = null,
  onSave,
  onCancel,
  isEditing = false,
  autoSave = true 
}) => {
  // State management
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState([]);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [uploadingImages, setUploadingImages] = useState([]);

  // Refs
  const quillRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Generate slug when title changes
  useEffect(() => {
    if (title && !isEditing) {
      const newSlug = slugify(title);
      setSlug(newSlug);
    }
  }, [title, isEditing]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !title || !content) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, title, excerpt, tags, autoSave]);

  // Custom image handler for Quill
  const imageHandler = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const imageId = Date.now().toString();
      setUploadingImages(prev => [...prev, imageId]);

      try {
        // Show loading state
        const loadingToast = toast.info('Subiendo imagen...', {
          autoClose: false,
        });

        // Upload image to Firebase
        const result = await uploadBlogImage(file, blogId || 'temp');
        
        // Insert image into editor
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', result.url);
        quill.setSelection(range.index + 1);

        // Success feedback
        toast.dismiss(loadingToast);
        toast.success('Imagen subida correctamente');

      } catch (error) {
        console.error('Image upload error:', error);
        toast.error(`Error al subir imagen: ${error.message}`);
      } finally {
        setUploadingImages(prev => prev.filter(id => id !== imageId));
      }
    };
  }, [blogId]);

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
      matchVisual: false // Prevent pasting with formatting
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

  // Auto-save function
  const handleAutoSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const blogData = {
        title,
        slug,
        content,
        excerpt,
        tags,
        featuredImage,
        isPublished: false, // Auto-saves are always drafts
        updatedAt: new Date(),
        isDraft: true
      };

      if (onSave) {
        await onSave(blogData, true); // true indicates auto-save
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Manual save function
  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!content.trim()) {
      toast.error('El contenido es obligatorio');
      return;
    }

    try {
      setIsSaving(true);
      
      const blogData = {
        title: title.trim(),
        slug: slug || slugify(title),
        content,
        excerpt: excerpt || generateExcerpt(content),
        tags,
        featuredImage,
        isPublished: publish,
        [publish ? 'publishedAt' : 'updatedAt']: new Date(),
        isDraft: !publish
      };

      if (onSave) {
        await onSave(blogData, false); // false indicates manual save
      }

      toast.success(publish ? 'Blog publicado correctamente' : 'Blog guardado como borrador');
      setLastSaved(new Date());
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate excerpt from content
  const generateExcerpt = (htmlContent) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, ''); // Strip HTML
    return textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
  };

  // Handle tag input
  const handleTagsChange = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        e.target.value = '';
      }
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Featured image upload
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const loadingToast = toast.info('Subiendo imagen destacada...', {
        autoClose: false,
      });

      const result = await uploadBlogImage(file, blogId || 'temp');
      setFeaturedImage(result);
      
      toast.dismiss(loadingToast);
      toast.success('Imagen destacada subida correctamente');
    } catch (error) {
      console.error('Featured image upload error:', error);
      toast.error(`Error al subir imagen destacada: ${error.message}`);
    }
  };

  return (
    <div className="blog-editor">
      <Helmet>
        <title>{isEditing ? 'Editar Blog' : 'Crear Nuevo Blog'} | AguaZarca</title>
        <meta name="description" content="Editor de blog profesional para AguaZarca Inmobiliaria" />
      </Helmet>

      {/* Editor Header */}
      <div className="blog-editor-header">
        <div className="blog-editor-title">
          <h1>{isEditing ? 'Editar Blog' : 'Crear Nuevo Blog'}</h1>
          {lastSaved && (
            <span className="last-saved">
              Último guardado: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="blog-editor-actions">
          {isSaving && <span className="saving-indicator">Guardando...</span>}
          <button 
            className="btn-secondary" 
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button 
            className="btn-draft" 
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            Guardar Borrador
          </button>
          <button 
            className="btn-publish" 
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            Publicar Blog
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="blog-editor-content">
        {/* Left Column - Editor */}
        <div className="blog-editor-main">
          {/* Title Input */}
          <div className="blog-field">
            <input
              type="text"
              placeholder="Título del blog..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="blog-title-input"
              maxLength={100}
            />
            <div className="character-count">{title.length}/100</div>
          </div>

          {/* Slug Input */}
          <div className="blog-field">
            <label htmlFor="slug">URL del blog:</label>
            <div className="slug-preview">
              aguazarca.com.ar/blog/
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="blog-slug-input"
                placeholder="url-del-blog"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="blog-field">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Escribe el contenido de tu blog aquí..."
              style={{ height: '400px', marginBottom: '50px' }}
            />
          </div>
        </div>

        {/* Right Sidebar - Metadata */}
        <div className="blog-editor-sidebar">
          {/* Featured Image */}
          <div className="blog-sidebar-section">
            <h3>Imagen Destacada</h3>
            {featuredImage ? (
              <div className="featured-image-preview">
                <img src={featuredImage.url} alt="Imagen destacada" />
                <button 
                  className="remove-featured-image"
                  onClick={() => setFeaturedImage(null)}
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="featured-image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  className="file-input"
                  id="featured-image-input"
                />
                <label htmlFor="featured-image-input" className="file-input-label">
                  Subir Imagen Destacada
                </label>
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="blog-sidebar-section">
            <h3>Extracto</h3>
            <textarea
              placeholder="Breve descripción del blog (opcional)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="blog-excerpt-input"
              maxLength={160}
              rows={3}
            />
            <div className="character-count">{excerpt.length}/160</div>
          </div>

          {/* Tags */}
          <div className="blog-sidebar-section">
            <h3>Etiquetas</h3>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Agregar etiqueta (Enter o coma para agregar)"
              onKeyDown={handleTagsChange}
              className="tag-input"
            />
          </div>

          {/* Publishing Options */}
          <div className="blog-sidebar-section">
            <h3>Opciones de Publicación</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publicar inmediatamente
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;