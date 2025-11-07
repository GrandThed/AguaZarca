'use client';

import { useState, useEffect } from 'react';
import { getBusinessContact } from '@/lib/api-client';

interface BusinessContact {
  businessName: string;
  whatsapp: string | null;
  email: string;
}

export function useBusinessContact() {
  const [contact, setContact] = useState<BusinessContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const data = await getBusinessContact();
        setContact(data);
      } catch (err: any) {
        console.error('Error fetching business contact:', err);
        setError(err.message || 'Failed to fetch contact information');
        // Fallback to environment variable if available
        setContact({
          businessName: 'AguaZarca',
          whatsapp: process.env.NEXT_PUBLIC_AGENT_WHATSAPP || null,
          email: 'contacto@aguazarca.com.ar'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  return { contact, loading, error };
}