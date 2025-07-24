// Utility function to create SEO-friendly slugs
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove accents and special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove all non-word chars except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Generate property slug with location and type
export const generatePropertySlug = (property) => {
  if (!property) return '';
  
  const parts = [];
  
  // Add property type if available
  if (property.type) {
    parts.push(slugify(property.type));
  }
  
  // Add city if available
  if (property.location?.city) {
    parts.push(slugify(property.location.city));
  }
  
  // Add title (truncated to avoid very long URLs)
  if (property.title) {
    const titleSlug = slugify(property.title);
    parts.push(titleSlug.substring(0, 50)); // Limit to 50 chars
  }
  
  return parts.join('-');
};

// Create full property URL
export const createPropertyUrl = (property, id) => {
  const slug = generatePropertySlug(property);
  return `/propiedad/${id}/${slug}`;
};