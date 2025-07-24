import { generatePropertySlug } from './slugify';

// Generate comprehensive social media meta tags for property pages
export const generateSocialMetaTags = (property, propertyId) => {
  if (!property) return {};

  const baseUrl = "https://aguazarca.com.ar";
  
  // Ensure image URL is absolute with proper fallbacks
  const getAbsoluteImageUrl = (imageUrl) => {
    // If no image provided, use panoramic view as fallback
    if (!imageUrl) {
      return `${baseUrl}/images/vcp-panoramica.jpg`;
    }
    
    // If already absolute URL, return as-is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Handle relative URLs
    if (imageUrl.startsWith('/')) {
      return `${baseUrl}${imageUrl}`;
    }
    
    // Handle Firebase storage URLs or other relative paths
    return `${baseUrl}/${imageUrl}`;
  };

  // Get the best available image for social sharing
  const getBestSocialImage = () => {
    // Try to get the first property image
    if (property.images && property.images.length > 0) {
      return getAbsoluteImageUrl(property.images[0]);
    }
    
    // Fallback to panoramic view
    return getAbsoluteImageUrl(null);
  };

  const primaryImage = getBestSocialImage();
  
  // Format price for display
  const formatPrice = () => {
    if (!property.price?.value) return 'Consultar precio';
    
    const currency = property.price.currency === 'USD' ? 'US$' : '$';
    const formattedValue = new Intl.NumberFormat('es-AR').format(property.price.value);
    return `${currency} ${formattedValue}`;
  };

  const price = formatPrice();
  const location = property.location?.city ? 
    `${property.location.city}${property.location.state ? `, ${property.location.state}` : ''}` : '';
  
  // Create optimized description for social sharing
  const createDescription = () => {
    const parts = [];
    
    if (property.type) parts.push(property.type);
    if (location) parts.push(`en ${location}`);
    if (price !== 'Consultar precio') parts.push(price);
    
    const prefix = parts.join(' - ');
    const description = property.description || '';
    const maxLength = 160; // Optimal for most platforms
    
    if (prefix.length + description.length <= maxLength) {
      return `${prefix}. ${description}`.trim();
    }
    
    const remainingLength = maxLength - prefix.length - 4; // 4 for ". ..."
    const truncatedDescription = description.substring(0, remainingLength);
    return `${prefix}. ${truncatedDescription}...`.trim();
  };

  const description = createDescription();
  const propertyUrl = `${baseUrl}/propiedad/${propertyId}/${generatePropertySlug(property)}`;
  
  // Generate comprehensive meta tags
  return {
    // Basic meta
    title: `${property.title}${location ? ` - ${location}` : ''} | AguaZarca Inmobiliaria`,
    description: description,
    canonical: propertyUrl,
    
    // Open Graph (Facebook, WhatsApp, LinkedIn)
    og: {
      title: `${property.title}${location ? ` - ${location}` : ''}`,
      description: description,
      image: primaryImage,
      imageWidth: "1200",
      imageHeight: "630",
      imageAlt: `${property.title} - ${property.type}${location ? ` en ${location}` : ''}`,
      url: propertyUrl,
      type: "website",
      siteName: "AguaZarca Inmobiliaria",
      locale: "es_AR",
    },
    
    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: `${property.title}${location ? ` - ${location}` : ''}`,
      description: description,
      image: primaryImage,
      imageAlt: `${property.title} - ${property.type}${location ? ` en ${location}` : ''}`,
      // site: "@aguazarca", // Uncomment if you have Twitter account
    },
    
    // Additional meta for rich previews
    additional: {
      author: property.agent?.name || "AguaZarca Inmobiliaria",
      tags: [property.type, property.location?.city, property.comercialStatus]
        .filter(Boolean)
        .join(', '),
      priceAmount: property.price?.value?.toString(),
      priceCurrency: property.price?.currency || 'ARS',
      availability: 'in_stock',
      condition: 'new'
    }
  };
};

// Generate image gallery for social media (for future use)
export const generateImageGallery = (images, maxImages = 4) => {
  if (!images || !Array.isArray(images)) return [];
  
  const baseUrl = "https://aguazarca.com.ar";
  
  return images.slice(0, maxImages).map((image, index) => ({
    url: image.startsWith('http') ? image : `${baseUrl}${image}`,
    alt: `Imagen ${index + 1} de la propiedad`,
    width: "1200",
    height: "630"
  }));
};