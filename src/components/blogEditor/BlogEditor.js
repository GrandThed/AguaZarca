import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { uploadBlogImage } from '../../utils/blogImageUpload';
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
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Auto-save functionality disabled
  // useEffect(() => {
  //   if (!autoSave || !title || !content) return;

  //   // Clear existing timeout
  //   if (autoSaveTimeoutRef.current) {
  //     clearTimeout(autoSaveTimeoutRef.current);
  //   }

  //   // Set new timeout
  //   autoSaveTimeoutRef.current = setTimeout(() => {
  //     handleAutoSave();
  //   }, 3000); // Auto-save after 3 seconds of inactivity

  //   return () => {
  //     if (autoSaveTimeoutRef.current) {
  //       clearTimeout(autoSaveTimeoutRef.current);
  //     }
  //   };
  // }, [content, title, excerpt, tags, autoSave]);

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

  // Auto-save function disabled
  // const handleAutoSave = async () => {
  //   if (isSaving) return;

  //   try {
  //     setIsSaving(true);
  //     const blogData = {
  //       title,
  //       slug,
  //       content,
  //       excerpt,
  //       tags,
  //       featuredImage,
  //       isPublished: false, // Auto-saves are always drafts
  //       updatedAt: new Date(),
  //       isDraft: true
  //     };

  //     if (onSave) {
  //       await onSave(blogData, true); // true indicates auto-save
  //     }

  //     setLastSaved(new Date());
  //   } catch (error) {
  //     console.error('Auto-save error:', error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // Manual save function
  const handleSave = async (forceDraft = false) => {
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
      
      // Use forceDraft to override the radio button selection (for draft button)
      const shouldPublish = forceDraft ? false : isPublished;
      
      const blogData = {
        title: title.trim(),
        slug: slug || slugify(title),
        content,
        excerpt: excerpt || generateExcerpt(content),
        tags,
        featuredImage,
        isPublished: shouldPublish,
        [shouldPublish ? 'publishedAt' : 'updatedAt']: new Date(),
        isDraft: !shouldPublish
      };


      if (onSave) {
        await onSave(blogData);
      }

      toast.success(shouldPublish ? 'Blog publicado correctamente' : 'Blog guardado como borrador');
      
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
  const handleFeaturedImageUpload = async (file) => {
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

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFeaturedImageUpload(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Check if it's an image
      if (file.type.startsWith('image/')) {
        handleFeaturedImageUpload(file);
      } else {
        toast.error('Por favor, selecciona solo archivos de imagen');
      }
    }
  };

  return (
    <div className="blog-editor-page">
      <Helmet>
        <title>{isEditing ? 'Editar Blog' : 'Crear Nuevo Blog'} | AguaZarca</title>
        <meta name="description" content="Editor de blog profesional para AguaZarca Inmobiliaria" />
      </Helmet>

      {/* Hero Section */}
      <div className="blog-editor-hero">
        <div className="blog-editor-hero-content">
          <div className="blog-editor-hero-text">
            <h1 className="blog-editor-hero-title">
              {isEditing ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
            </h1>
            <p className="blog-editor-hero-subtitle">
              {isEditing 
                ? 'Modifica tu artículo y comparte actualizaciones con tu audiencia'
                : 'Comparte tus conocimientos y experiencias inmobiliarias con nuestra comunidad'
              }
            </p>
          </div>
          <div className="blog-editor-hero-actions">
            {isSaving && (
              <div className="saving-indicator">
                <div className="saving-spinner"></div>
                <span>Guardando...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="blog-editor-actions-bar">
        <div className="blog-editor-actions-content">
          <div className="blog-editor-breadcrumb">
            <span>Blog</span>
            <span className="breadcrumb-separator">→</span>
            <span>{isEditing ? 'Editar' : 'Crear'}</span>
          </div>
          
          <div className="blog-editor-actions">
            <button 
              className="btn-secondary" 
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button 
              className="btn-draft" 
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              Guardar Borrador
            </button>
            <button 
              className="btn-publish" 
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isPublished ? 'Publicar Blog' : 'Guardar Borrador'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Container */}
      <div className="blog-editor-container">
        <div className="blog-editor-content">
          {/* Left Column - Editor */}
          <div className="blog-editor-main">
            {/* Title Input */}
            <div className="blog-field blog-field-title">
              <label htmlFor="title" className="blog-field-label">
                Título del artículo
              </label>
              <input
                id="title"
                type="text"
                placeholder="Escribe un título atractivo para tu artículo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="blog-title-input"
                maxLength={100}
              />
              <div className="character-count">{title.length}/100</div>
            </div>

            {/* Slug Input */}
            <div className="blog-field">
              <label htmlFor="slug" className="blog-field-label">
                URL del artículo
              </label>
              <div className="slug-preview">
                <span className="slug-domain">aguazarca.com.ar/blog/</span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="blog-slug-input"
                  placeholder="url-del-articulo"
                />
              </div>
              <div className="field-help">
                La URL se genera automáticamente basada en el título
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="blog-field blog-field-editor">
              <label className="blog-field-label">
                Contenido del artículo
              </label>
              <div className="editor-wrapper">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Escribe el contenido de tu artículo aquí. Puedes usar el formato de texto, insertar imágenes y crear listas..."
                  style={{ height: '500px', marginBottom: '50px' }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Metadata */}
          <div className="blog-editor-sidebar">
            <div className="sidebar-header">
              <h2>Configuración del Artículo</h2>
              <p>Personaliza cómo se mostrará tu artículo</p>
            </div>

            {/* Featured Image */}
            <div className="blog-sidebar-section">
              <h3 className="sidebar-section-title">
                <span className="section-icon">🖼️</span>
                Imagen Destacada
              </h3>
              <p className="section-description">
                Selecciona una imagen que represente tu artículo
              </p>
              {featuredImage ? (
                <div className="featured-image-preview">
                  <img src={featuredImage.url} alt="Imagen destacada" />
                  <div className="image-actions">
                    <button 
                      className="btn-remove-image"
                      onClick={() => setFeaturedImage(null)}
                    >
                      Cambiar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`featured-image-upload ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <p>{isDragOver ? 'Suelta la imagen aquí' : 'Arrastra una imagen aquí'}</p>
                    <span className="upload-or">o</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="file-input"
                    id="featured-image-input"
                  />
                  <label htmlFor="featured-image-input" className="file-input-label">
                    Seleccionar Imagen
                  </label>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="blog-sidebar-section">
              <h3 className="sidebar-section-title">
                <span className="section-icon">📝</span>
                Extracto
              </h3>
              <p className="section-description">
                Breve descripción que aparecerá en la lista de artículos
              </p>
              <textarea
                placeholder="Escribe un resumen atractivo de tu artículo..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="blog-excerpt-input"
                maxLength={160}
                rows={4}
              />
              <div className="character-count">{excerpt.length}/160</div>
              <div className="field-help">
                Se generará automáticamente si se deja vacío
              </div>
            </div>

            {/* Tags */}
            <div className="blog-sidebar-section">
              <h3 className="sidebar-section-title">
                <span className="section-icon">🏷️</span>
                Etiquetas
              </h3>
              <p className="section-description">
                Agrega etiquetas para categorizar tu artículo
              </p>
              <div className="tags-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <span className="tag-text">#{tag}</span>
                    <button 
                      className="tag-remove"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remover etiqueta ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <div className="no-tags">
                    <span>No hay etiquetas</span>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Escribe una etiqueta y presiona Enter..."
                onKeyDown={handleTagsChange}
                className="tag-input"
              />
              <div className="field-help">
                Presiona Enter o coma para agregar etiquetas
              </div>
            </div>

            {/* Publishing Options */}
            <div className="blog-sidebar-section">
              <h3 className="sidebar-section-title">
                <span className="section-icon">🚀</span>
                Estado de Publicación
              </h3>
              <div className="publishing-options">
                <label className="publish-option">
                  <input
                    type="radio"
                    name="publishStatus"
                    value="published"
                    checked={isPublished}
                    onChange={() => setIsPublished(true)}
                  />
                  <div className="option-content">
                    <div className="option-title">Publicar ahora</div>
                    <div className="option-description">
                      Visible para todos los visitantes inmediatamente
                    </div>
                  </div>
                </label>
                <label className="publish-option">
                  <input
                    type="radio"
                    name="publishStatus"
                    value="draft"
                    checked={!isPublished}
                    onChange={() => setIsPublished(false)}
                  />
                  <div className="option-content">
                    <div className="option-title">Borrador</div>
                    <div className="option-description">
                      Guarda tu trabajo sin publicar
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;