import { useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';

/**
 * PageWrapper - Wraps page components to set SEO meta tags
 * Usage: <PageWrapper seoConfig={seoConfig}><YourComponent/></PageWrapper>
 */
export const PageWrapper = ({ 
  children, 
  title, 
  description, 
  keywords, 
  canonical,
  ogImage,
  structuredData,
  robots = 'index, follow'
}) => {
  useSEO({
    title,
    description,
    keywords,
    canonical,
    ogImage,
    structuredData,
    robots,
  });

  return <>{children}</>;
};

export default PageWrapper;
