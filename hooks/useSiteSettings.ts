'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { getPublicSettings } from '@/lib/api-client';

interface SiteSettings {
  // General settings
  'site.name'?: string;

  // Contact settings
  'contact.whatsapp'?: string;
  'contact.phone'?: string;
  'contact.email'?: string;
  'contact.address'?: string;
  'contact.business_hours'?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  // Social media settings
  'social.facebook'?: string;
  'social.instagram'?: string;
  'social.twitter'?: string;
  'social.linkedin'?: string;

  // SEO settings
  'seo.title'?: string;
  'seo.description'?: string;
  'seo.keywords'?: string;

  // Any other dynamic settings
  [key: string]: any;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;

  // Convenience getters for common settings
  siteName: string;
  whatsappNumber: string | null;
  phoneNumber: string | null;
  email: string;
  address: string;
  businessHours: SiteSettings['contact.business_hours'] | null;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

export function useSiteSettings(): SiteSettingsContextType {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}

export function useSiteSettingsProvider(): SiteSettingsContextType {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Error fetching site settings:', err);
      setError(err.message || 'Failed to fetch site settings');

      // Fallback to default values
      setSettings({
        'site.name': 'AguaZarca',
        'contact.whatsapp': process.env.NEXT_PUBLIC_AGENT_WHATSAPP || undefined,
        'contact.phone': '+54 11 1234-5678',
        'contact.email': 'contacto@aguazarca.com.ar',
        'contact.address': 'Buenos Aires, Argentina',
        'contact.business_hours': {
          monday: '9:00-18:00',
          tuesday: '9:00-18:00',
          wednesday: '9:00-18:00',
          thursday: '9:00-18:00',
          friday: '9:00-18:00',
          saturday: '9:00-13:00',
          sunday: 'Cerrado'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Convenience getters
  const siteName = settings['site.name'] || 'AguaZarca';
  const whatsappNumber = settings['contact.whatsapp'] || null;
  const phoneNumber = settings['contact.phone'] || null;
  const email = settings['contact.email'] || 'contacto@aguazarca.com.ar';
  const address = settings['contact.address'] || 'Buenos Aires, Argentina';
  const businessHours = settings['contact.business_hours'] || null;

  return {
    settings,
    loading,
    error,
    refreshSettings,
    siteName,
    whatsappNumber,
    phoneNumber,
    email,
    address,
    businessHours,
  };
}

export { SiteSettingsContext };

// Legacy hook for backward compatibility
export function useBusinessContact() {
  const { whatsappNumber, phoneNumber, email, siteName, loading, error } = useSiteSettings();

  return {
    contact: {
      businessName: siteName,
      whatsapp: whatsappNumber,
      phone: phoneNumber,
      email: email
    },
    loading,
    error
  };
}