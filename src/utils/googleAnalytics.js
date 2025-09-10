// Google Analytics Measurement ID - set this in your environment variables
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID not found in environment variables');
    return;
  }

  // Create gtag script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (path, title) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track property-specific events
export const trackPropertyEvent = (action, propertyId, propertyType) => {
  trackEvent(action, 'property', `${propertyType}_${propertyId}`);
};

// Track form submissions
export const trackFormSubmission = (formName, success = true) => {
  trackEvent(success ? 'form_submit_success' : 'form_submit_error', 'engagement', formName);
};

// Track search events
export const trackSearch = (searchTerm, resultCount) => {
  trackEvent('search', 'engagement', searchTerm, resultCount);
};

// Track WhatsApp button clicks
export const trackWhatsAppClick = (propertyId) => {
  trackEvent('whatsapp_click', 'contact', propertyId);
};

// Track image views
export const trackImageView = (propertyId, imageIndex) => {
  trackEvent('image_view', 'property', `${propertyId}_image_${imageIndex}`);
};