import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { auth } from "../../../firebase";
import { isAdmin } from "../../../utils/auth";
import BlogEditor from "../../blogEditor/BlogEditor";
import BlogService from "../../../utils/blogService";
import * as ROUTES from "../../../routes";

const BlogCreateNew = () => {
  const { id } = useParams();
  const [user] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [blogData, setBlogData] = useState(null);
  const history = useHistory();
  const isEditing = !!id;

  // Load existing blog data for editing
  useEffect(() => {
    const loadBlogData = async () => {
      if (!isEditing) return;

      try {
        setLoading(true);
        const blog = await BlogService.getBlogById(id);
        setBlogData(blog);
      } catch (error) {
        console.error('Error loading blog for editing:', error);
        toast.error('Error al cargar el blog para editar');
        history.push(ROUTES.BLOGS);
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, [id, isEditing, history]);

  // Check authentication and admin permissions
  if (!user || !isAdmin()) {
    return <Redirect to={ROUTES.HOME} />;
  }

  // Handle blog save (manual save only)
  const handleSave = async (blogFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate required fields for publishing
      if (blogFormData.isPublished) {
        if (!blogFormData.title.trim()) {
          throw new Error('El título es obligatorio para publicar');
        }
        if (!blogFormData.content.trim()) {
          throw new Error('El contenido es obligatorio para publicar');
        }
      }

      let resultBlog;

      if (isEditing) {
        // Update existing blog
        resultBlog = await BlogService.updateBlog(id, blogFormData, user.uid);
        toast.success(blogFormData.isPublished ? 'Blog actualizado y publicado correctamente' : 'Borrador actualizado correctamente');
      } else {
        // Generate unique slug for new blog
        const uniqueSlug = await BlogService.generateUniqueSlug(blogFormData.title);
        blogFormData.slug = uniqueSlug;

        // Create new blog post
        resultBlog = await BlogService.createBlog(blogFormData, user.uid);
        toast.success(blogFormData.isPublished ? 'Blog publicado correctamente' : 'Borrador guardado correctamente');
      }

      // Redirect to the blog or blog list
      if (blogFormData.isPublished && resultBlog.slug) {
        history.push(`${ROUTES.BLOGS}/${resultBlog.slug}`);
      } else {
        history.push(ROUTES.BLOGS);
      }

      return resultBlog;
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(`Error al guardar el blog: ${error.message}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.')) {
      history.push(ROUTES.BLOGS);
    }
  };

  // Show loading state when loading blog data for editing
  if (loading) {
    return (
      <div className="blog-create-loading">
        <div className="loading-spinner"></div>
        <p>Cargando blog...</p>
      </div>
    );
  }

  return (
    <div className="blog-create-page">
      <Helmet>
        <title>{isEditing ? 'Editar Blog' : 'Crear Nuevo Blog'} | AguaZarca Inmobiliaria</title>
        <meta name="description" content={isEditing ? 'Editar artículo de blog' : 'Crear un nuevo artículo de blog para AguaZarca Inmobiliaria'} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <BlogEditor
        initialContent={blogData?.content || ""}
        initialTitle={blogData?.title || ""}
        initialSlug={blogData?.slug || ""}
        initialExcerpt={blogData?.excerpt || ""}
        initialTags={blogData?.tags || []}
        initialFeaturedImage={blogData?.featuredImage || null}
        initialIsPublished={blogData?.isPublished ?? true}
        blogId={isEditing ? id : null}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={isEditing}
        autoSave={false}
      />
    </div>
  );
};

export default BlogCreateNew;