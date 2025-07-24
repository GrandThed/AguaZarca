import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './breadcrumb.css';

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) return null;

  // Generate structured data for breadcrumbs
  const generateBreadcrumbStructuredData = () => {
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url ? `https://aguazarca.com.ar${item.url}` : undefined
      }))
    };
    
    return JSON.stringify(breadcrumbList, null, 2);
  };

  return (
    <nav className="breadcrumb-nav" aria-label="Navegación de ruta" role="navigation">
      <Helmet>
        <script type="application/ld+json">
          {generateBreadcrumbStructuredData()}
        </script>
      </Helmet>
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.url && index < items.length - 1 ? (
              <Link 
                to={item.url} 
                className="breadcrumb-link"
                aria-label={`Ir a ${item.name}`}
              >
                {item.name}
              </Link>
            ) : (
              <span 
                className="breadcrumb-current" 
                aria-current="page"
              >
                {item.name}
              </span>
            )}
            {index < items.length - 1 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                &gt;
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;