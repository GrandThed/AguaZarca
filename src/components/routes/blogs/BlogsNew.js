import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthState } from 'react-firebase-hooks/auth';
import { IconContext } from 'react-icons';
import { 
  FaPlus, 
  FaSearch, 
  FaCalendar, 
  FaClock, 
  FaEye, 
  FaHeart,
  FaFilter,
  FaTimes,
  FaRegNewspaper
} from 'react-icons/fa';
import { auth } from '../../../firebase';
import { isAdmin } from '../../../utils/auth';
import BlogService from '../../../utils/blogService';
import { PageTitle } from '../../pageTitle/PageTitle';
import * as ROUTES from '../../../routes';
import './blogsNew.css';

const BlogsNew = () => {
  const [user] = useAuthState(auth);
  const location = useLocation();
  
  // State
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get tag from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tagFromUrl = urlParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [location.search]);

  // Load blogs function
  const loadBlogs = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setBlogs([]);
        setLastDoc(null);
      }

      let result;
      
      if (selectedTag) {
        // Load blogs by tag
        result = await BlogService.getBlogsByTag(selectedTag, 10);
        result = { blogs: result, hasMore: false, lastDoc: null };
      } else if (searchTerm) {
        // Search blogs
        result = await BlogService.searchBlogs(searchTerm, 10);
        result = { blogs: result, hasMore: false, lastDoc: null };
      } else {
        // Load all blogs in development, published blogs in production
        if (process.env.NODE_ENV === 'development') {
          result = await BlogService.getAllBlogs(null, 10, reset ? null : lastDoc);
        } else {
          result = await BlogService.getPublishedBlogs(10, reset ? null : lastDoc);
        }
      }

      if (reset) {
        setBlogs(result.blogs);
      } else {
        setBlogs(prev => [...prev, ...result.blogs]);
      }
      
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);

      // Extract all unique tags
      if (reset || allTags.length === 0) {
        const tags = new Set();
        result.blogs.forEach(blog => {
          if (blog.tags) {
            blog.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags([...tags].sort());
      }

    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedTag, searchTerm]);

  // Load initial blogs
  useEffect(() => {
    loadBlogs(true);
  }, [selectedTag]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSelectedTag('');
      loadBlogs(true);
    }
  };

  // Handle tag filter
  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    setSearchTerm('');
    // Update URL
    const url = new URL(window.location);
    if (tag) {
      url.searchParams.set('tag', tag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.pushState({}, '', url);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    const url = new URL(window.location);
    url.searchParams.delete('tag');
    window.history.pushState({}, '', url);
    loadBlogs(true);
  };

  // Load more blogs
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadBlogs(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate excerpt
  const generateExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  return (
    <div className="blogs-page">
      <Helmet>
        <title>Blog - AguaZarca Inmobiliaria | Noticias y Consejos Inmobiliarios</title>
        <meta 
          name="description" 
          content="Blog de AguaZarca Inmobiliaria. Noticias, consejos y tendencias del mercado inmobiliario en Villa Carlos Paz y alrededores." 
        />
        <meta property="og:title" content="Blog - AguaZarca Inmobiliaria" />
        <meta property="og:description" content="Noticias, consejos y tendencias del mercado inmobiliario en Villa Carlos Paz." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://aguazarca.com.ar/images/vcp-panoramica.jpg" />
        <link rel="canonical" href="https://aguazarca.com.ar/blog" />
      </Helmet>

      {/* Hero Section */}
      <div className="blog-hero">
        <div className="blog-hero-content">
          <div className="blog-hero-text">
            <h1 className="blog-hero-title">Blog Inmobiliario</h1>
            <p className="blog-hero-subtitle">
              Descubre consejos expertos, tendencias del mercado y noticias inmobiliarias 
              de Villa Carlos Paz y alrededores
            </p>
          </div>
          <div className="blog-hero-stats">
            <div className="blog-stat">
              <span className="blog-stat-number">{blogs.length}</span>
              <span className="blog-stat-label">Artículos</span>
            </div>
            <div className="blog-stat">
              <span className="blog-stat-number">{allTags.length}</span>
              <span className="blog-stat-label">Categorías</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Search and Admin Actions */}
      <div className="blogs-header">
        <div className="blogs-header-content">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="blog-search-form">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar en el blog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="clear-search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button type="submit" className="search-button">
              Buscar
            </button>
          </form>

          {/* Admin Create Button */}
          {isAdmin() && (
            <Link to={ROUTES.BLOG_CREATE} className="create-blog-btn">
              <FaPlus /> Crear Blog
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="blogs-filters">
          <div className="filter-section">
            <FaFilter className="filter-icon" />
            <span className="filter-label">Filtrar por etiqueta:</span>
            
            <div className="tags-filter">
              <button
                onClick={() => handleTagFilter('')}
                className={`tag-filter ${selectedTag === '' ? 'active' : ''}`}
              >
                Todas
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`tag-filter ${selectedTag === tag ? 'active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedTag) && (
            <div className="active-filters">
              <span>Filtros activos:</span>
              {searchTerm && (
                <span className="active-filter">
                  Búsqueda: "{searchTerm}"
                </span>
              )}
              {selectedTag && (
                <span className="active-filter">
                  Etiqueta: {selectedTag}
                </span>
              )}
              <button onClick={clearFilters} className="clear-filters">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="blogs-loading">
          <div className="loading-spinner"></div>
          <p>Cargando blogs...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && blogs.length === 0 && (
        <div className="no-blogs">
          <h3>No se encontraron blogs</h3>
          {searchTerm || selectedTag ? (
            <p>Intenta cambiar los filtros de búsqueda.</p>
          ) : (
            <p>Aún no hay blogs publicados.</p>
          )}
          {isAdmin() && (
            <Link to={ROUTES.BLOG_CREATE} className="btn-primary">
              Crear el primer blog
            </Link>
          )}
        </div>
      )}

      {/* Featured Blog (First Blog) */}
      {!loading && blogs.length > 0 && (
        <div className="featured-blog-section">
          <h2 className="section-title">Artículo Destacado</h2>
          <article className="featured-blog-card">
            <Link to={`${ROUTES.BLOGS}/${blogs[0].slug}`} className="featured-blog-link">
              <div className="featured-blog-image">
                {blogs[0].featuredImage ? (
                  <img 
                    src={blogs[0].featuredImage.url} 
                    alt={blogs[0].title}
                    loading="lazy"
                  />
                ) : (
                  <div className="featured-blog-placeholder">
                    <FaRegNewspaper className="placeholder-icon" />
                  </div>
                )}
                <div className="featured-blog-overlay">
                  <div className="featured-blog-badge">Destacado</div>
                </div>
              </div>
              
              <div className="featured-blog-content">
                {blogs[0].tags && blogs[0].tags.length > 0 && (
                  <div className="featured-blog-tags">
                    {blogs[0].tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="featured-blog-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <h2 className="featured-blog-title">{blogs[0].title}</h2>
                <p className="featured-blog-excerpt">
                  {blogs[0].excerpt || generateExcerpt(blogs[0].content, 200)}
                </p>
                
                <div className="featured-blog-meta">
                  <IconContext.Provider value={{ className: "featured-blog-meta-icon" }}>
                    <div className="featured-blog-meta-item">
                      <FaCalendar />
                      <span>{formatDate(blogs[0].publishedAt)}</span>
                    </div>
                    <div className="featured-blog-meta-item">
                      <FaClock />
                      <span>{blogs[0].readingTime} min de lectura</span>
                    </div>
                    <div className="featured-blog-meta-item">
                      <FaEye />
                      <span>{blogs[0].views || 0} vistas</span>
                    </div>
                  </IconContext.Provider>
                </div>
                
                <div className="featured-blog-cta">
                  <span className="read-more-btn">Leer artículo completo →</span>
                </div>
              </div>
            </Link>
          </article>
        </div>
      )}

      {/* Recent Blogs Grid */}
      {!loading && blogs.length > 1 && (
        <div className="recent-blogs-section">
          <h2 className="section-title">Artículos Recientes</h2>
          <div className="blogs-grid">
            {blogs.slice(1).map((blog) => (
              <article key={blog.id} className="blog-card">
                <Link to={`${ROUTES.BLOGS}/${blog.slug}`} className="blog-card-link">
                  {/* Featured Image */}
                  <div className="blog-card-image">
                    {blog.featuredImage ? (
                      <img 
                        src={blog.featuredImage.url} 
                        alt={blog.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="blog-card-placeholder">
                        <FaRegNewspaper className="placeholder-icon" />
                      </div>
                    )}
                    <div className="blog-card-overlay">
                      <FaClock className="reading-time-icon" />
                      <span>{blog.readingTime} min</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="blog-card-content">
                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="blog-card-tags">
                        {blog.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="blog-card-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="blog-card-title">{blog.title}</h3>

                    {/* Excerpt */}
                    <p className="blog-card-excerpt">
                      {blog.excerpt || generateExcerpt(blog.content)}
                    </p>

                    {/* Meta */}
                    <div className="blog-card-meta">
                      <IconContext.Provider value={{ className: "blog-card-meta-icon" }}>
                        <div className="blog-card-meta-item">
                          <FaCalendar />
                          <span>{formatDate(blog.publishedAt)}</span>
                        </div>
                        
                        <div className="blog-card-meta-group">
                          <div className="blog-card-meta-item">
                            <FaEye />
                            <span>{blog.views || 0}</span>
                          </div>
                          
                          <div className="blog-card-meta-item">
                            <FaHeart />
                            <span>{blog.likes || 0}</span>
                          </div>
                        </div>
                      </IconContext.Provider>
                    </div>
                    
                    <div className="blog-card-footer">
                      <span className="read-more">Leer más →</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && blogs.length > 0 && (
        <div className="load-more-container">
          <button 
            onClick={loadMore}
            disabled={loadingMore}
            className="load-more-btn"
          >
            {loadingMore ? 'Cargando...' : 'Cargar más blogs'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogsNew;