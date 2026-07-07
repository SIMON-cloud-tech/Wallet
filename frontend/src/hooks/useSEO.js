import { useEffect } from 'react';
import { updateMetaTags, addStructuredData } from '../utils/seoUtils';

/**
 * Custom hook for updating page SEO
 * Usage: useSEO({ title, description, ... })
 */
export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  structuredData = null,
  robots = 'index, follow',
}) => {
  useEffect(() => {
    // Update meta tags
    updateMetaTags({
      title,
      description,
      keywords,
      canonical,
      ogImage,
      ogType,
      robots,
    });

    // Add structured data if provided
    if (structuredData) {
      addStructuredData(structuredData);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, [title, description, keywords, canonical, ogImage, ogType, structuredData, robots]);
};
