import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Redirect, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { auth } from "../../../firebase";
import { isAdmin } from "../../../utils/auth";
import BlogEditor from "../../blogEditor/BlogEditor";
import BlogService from "../../../utils/blogService";
import * as ROUTES from "../../../routes";

const BlogCreateNew = () => {
  const [user] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();

  // Check authentication and admin permissions
  if (!user || !isAdmin()) {
    return <Redirect to={ROUTES.HOME} />;
  }

  // Handle blog save (both draft and publish)
  const handleSave = async (blogData, isAutoSave = false) => {
    if (isSubmitting && !isAutoSave) return;

    try {
      setIsSubmitting(true);

      // Validate required fields for publishing
      if (blogData.isPublished) {
        if (!blogData.title.trim()) {
          throw new Error('El título es obligatorio para publicar');
        }
        if (!blogData.content.trim()) {
          throw new Error('El contenido es obligatorio para publicar');
        }
      }

      // Generate unique slug
      const uniqueSlug = await BlogService.generateUniqueSlug(blogData.title);
      blogData.slug = uniqueSlug;

      // Create the blog post
      const createdBlog = await BlogService.createBlog(blogData, user.uid);

      if (!isAutoSave) {
        // Redirect to the created blog or blog list
        if (blogData.isPublished) {
          toast.success('Blog publicado correctamente');
          history.push(`${ROUTES.BLOGS}/${createdBlog.slug}`);
        } else {
          toast.success('Borrador guardado correctamente');
          history.push(ROUTES.BLOGS);
        }
      }

      return createdBlog;
    } catch (error) {
      console.error('Error saving blog:', error);
      if (!isAutoSave) {
        toast.error(`Error al guardar el blog: ${error.message}`);
      }
      throw error;
    } finally {
      if (!isAutoSave) {
        setIsSubmitting(false);
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.')) {
      history.push(ROUTES.BLOGS);
    }
  };

  return (
    <div className="blog-create-page">
      <Helmet>
        <title>Crear Nuevo Blog | AguaZarca Inmobiliaria</title>
        <meta name="description" content="Crear un nuevo artículo de blog para AguaZarca Inmobiliaria" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <BlogEditor
        initialContent=""
        initialTitle=""
        initialSlug=""
        blogId={null}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={false}
        autoSave={true}
      />
    </div>
  );
};

export default BlogCreateNew;