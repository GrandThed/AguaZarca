import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { IconContext } from 'react-icons';
import { 
  FaCalendar, 
  FaClock, 
  FaEye, 
  FaHeart, 
  FaRegHeart, 
  FaShare, 
  FaEdit, 
  FaTrash,
  FaArrowLeft,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLink
} from 'react-icons/fa';
import { auth } from '../../../firebase';
import { isAdmin } from '../../../utils/auth';
import BlogService from '../../../utils/blogService';
import { generateSocialMetaTags } from '../../../utils/socialMeta';
import Breadcrumb from '../../breadcrumb/Breadcrumb';
import * as ROUTES from '../../../routes';
import './blogView.css';

const BlogViewNew = () => {
  const { slug } = useParams();
  const [user] = useAuthState(auth);
  const history = useHistory();
  
  // State
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Load blog data
  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get blog by slug - in development, try to get any blog (including drafts)
        let blogData;
        try {
          blogData = await BlogService.getBlogBySlug(slug);
        } catch (error) {
          // In development, if published blog not found, try to get any blog with this slug
          if (process.env.NODE_ENV === 'development') {
            try {
              const allBlogsResult = await BlogService.getAllBlogs(null, 50, null);
              const foundBlog = allBlogsResult.blogs.find(blog => blog.slug === slug);
              if (foundBlog) {
                blogData = foundBlog;
                // For drafts, manually increment views without waiting
                if (foundBlog.id) {
                  BlogService.incrementViews(foundBlog.id).catch(() => {
                    // Silently ignore view count errors
                  });
                }
              } else {
                throw new Error('Blog not found in development mode');
              }
            } catch (devError) {
              throw error; // Re-throw original error
            }
          } else {
            throw error;
          }
        }
        setBlog(blogData);
        setLikeCount(blogData.likes || 0);

        // Check if user has liked this blog
        if (user) {
          const hasLiked = await BlogService.hasUserLiked(blogData.id, user.uid);
          setLiked(hasLiked);
        }

        // Load related blogs
        if (blogData.tags && blogData.tags.length > 0) {
          const related = await BlogService.getBlogsByTag(blogData.tags[0], 3);
          setRelatedBlogs(related.filter(b => b.id !== blogData.id));
        }

      } catch (error) {
        console.error('Error loading blog detail:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBlog();
    }
  }, [slug, user]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) {
      toast.info('Debes iniciar sesión para dar like');
      return;
    }

    try {
      const result = await BlogService.toggleLike(blog.id, user.uid);
      setLiked(result.liked);
      setLikeCount(result.likes);
      
      toast.success(result.liked ? 'Te gusta este blog' : 'Ya no te gusta este blog');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Error al procesar tu like');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este blog? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await BlogService.deleteBlog(blog.id);
      toast.success('Blog eliminado correctamente');
      history.push(ROUTES.BLOGS);
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Error al eliminar el blog');
    }
  };

  // Share functions
  const shareUrl = `${window.location.origin}/blog/${slug}`;
  const shareTitle = blog?.title || '';
  const shareText = blog?.excerpt || '';

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedText = encodeURIComponent(shareText);

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Enlace copiado al portapapeles');
        setShowShareMenu(false);
        return;
      default:
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="blog-view-loading">
        <div className="loading-spinner"></div>
        <p>Cargando blog...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="blog-view-error">
        <h2>Error al cargar el blog</h2>
        <p>{error}</p>
        <Link to={ROUTES.BLOGS} className="btn-primary">
          Volver a blogs
        </Link>
      </div>
    );
  }

  // Blog not found
  if (!blog) {
    return (
      <div className="blog-view-error">
        <h2>Blog no encontrado</h2>
        <p>El blog que buscas no existe o ha sido eliminado.</p>
        <Link to={ROUTES.BLOGS} className="btn-primary">
          Volver a blogs
        </Link>
      </div>
    );
  }

  // Generate social meta tags
  const socialMeta = generateSocialMetaTags({
    title: blog.title,
    description: blog.excerpt || blog.seoDescription,
    images: blog.featuredImage ? [blog.featuredImage.url] : [],
    type: 'Blog Post'
  }, blog.id);

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Inicio', url: ROUTES.HOME },
    { name: 'Blog', url: ROUTES.BLOGS },
    { name: blog.title, url: null }
  ];

  return (
    <article className="blog-view">
      <Helmet>
        <title>{socialMeta.title}</title>
        <meta name="description" content={socialMeta.description} />
        <link rel="canonical" href={socialMeta.canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={socialMeta.og.title} />
        <meta property="og:description" content={socialMeta.og.description} />
        <meta property="og:image" content={socialMeta.og.image} />
        <meta property="og:url" content={socialMeta.og.url} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={socialMeta.additional.author} />
        <meta property="article:published_time" content={blog.publishedAt?.toDate?.()?.toISOString()} />
        <meta property="article:tag" content={blog.tags?.join(', ')} />
        
        {/* Twitter */}
        <meta name="twitter:card" content={socialMeta.twitter.card} />
        <meta name="twitter:title" content={socialMeta.twitter.title} />
        <meta name="twitter:description" content={socialMeta.twitter.description} />
        <meta name="twitter:image" content={socialMeta.twitter.image} />
      </Helmet>

      <Breadcrumb items={breadcrumbItems} />

      {/* Blog Header */}
      <header className="blog-header">
        <div className="blog-header-content">
          <Link to={ROUTES.BLOGS} className="back-link">
            <FaArrowLeft /> Volver a blogs
          </Link>

          {/* Admin Actions */}
          {isAdmin() && (
            <div className="admin-actions">
              <Link 
                to={`${ROUTES.BLOG_CREATE.replace(':id', blog.id)}`} 
                className="admin-btn edit-btn"
                title="Editar blog"
              >
                <FaEdit />
              </Link>
              <button 
                onClick={handleDelete} 
                className="admin-btn delete-btn"
                title="Eliminar blog"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="blog-featured-image">
            <img 
              src={blog.featuredImage.url} 
              alt={blog.title}
              loading="lazy"
            />
          </div>
        )}

        {/* Title and Meta */}
        <div className="blog-title-section">
          <h1 className="blog-title">{blog.title}</h1>
          
          <div className="blog-meta">
            <IconContext.Provider value={{ className: "blog-meta-icon" }}>
              <div className="blog-meta-item">
                <FaCalendar />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              
              <div className="blog-meta-item">
                <FaClock />
                <span>{blog.readingTime} min de lectura</span>
              </div>
              
              <div className="blog-meta-item">
                <FaEye />
                <span>{blog.views || 0} visualizaciones</span>
              </div>
              
              <div className="blog-meta-item">
                <button 
                  onClick={handleLike}
                  className={`like-button ${liked ? 'liked' : ''}`}
                  title={liked ? 'Quitar like' : 'Dar like'}
                >
                  {liked ? <FaHeart /> : <FaRegHeart />}
                  <span>{likeCount}</span>
                </button>
              </div>
              
              <div className="blog-meta-item">
                <div className="share-dropdown">
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="share-button"
                    title="Compartir"
                  >
                    <FaShare />
                    <span>Compartir</span>
                  </button>
                  
                  {showShareMenu && (
                    <div className="share-menu">
                      <button onClick={() => handleShare('facebook')}>
                        <FaFacebook /> Facebook
                      </button>
                      <button onClick={() => handleShare('twitter')}>
                        <FaTwitter /> Twitter
                      </button>
                      <button onClick={() => handleShare('whatsapp')}>
                        <FaWhatsapp /> WhatsApp
                      </button>
                      <button onClick={() => handleShare('copy')}>
                        <FaLink /> Copiar enlace
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </IconContext.Provider>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-tags">
              {blog.tags.map((tag, index) => (
                <Link 
                  key={index} 
                  to={`${ROUTES.BLOGS}?tag=${encodeURIComponent(tag)}`}
                  className="blog-tag"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Blog Content */}
      <div className="blog-content">
        <div 
          className="blog-text"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="related-blogs">
          <h3>Artículos relacionados</h3>
          <div className="related-blogs-grid">
            {relatedBlogs.map((relatedBlog) => (
              <Link 
                key={relatedBlog.id}
                to={`${ROUTES.BLOGS}/${relatedBlog.slug}`}
                className="related-blog-card"
              >
                {relatedBlog.featuredImage && (
                  <img 
                    src={relatedBlog.featuredImage.url} 
                    alt={relatedBlog.title}
                    loading="lazy"
                  />
                )}
                <div className="related-blog-content">
                  <h4>{relatedBlog.title}</h4>
                  <p>{relatedBlog.excerpt}</p>
                  <span className="read-time">{relatedBlog.readingTime} min</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default BlogViewNew;