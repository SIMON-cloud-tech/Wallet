import { useEffect } from 'react';
import { addStructuredData, organizationStructuredData, webApplicationStructuredData } from '../utils/seoUtils';

/**
 * SEOInit - Initialize SEO for the application
 * Should be rendered once at the root level
 */
export const SEOInit = () => {
  useEffect(() => {
    // Add organization structured data
    addStructuredData(organizationStructuredData);

    // Add web application structured data
    setTimeout(() => {
      addStructuredData(webApplicationStructuredData);
    }, 500);

    // Preload important resources
    preloadResources();

    // Monitor performance
    monitorPerformance();
  }, []);

  return null;
};

/**
 * Preload critical resources for better performance
 */
const preloadResources = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload API endpoints if needed
      fetch('/api/test', { method: 'HEAD' }).catch(() => {});
    });
  }
};

/**
 * Monitor Core Web Vitals for SEO
 */
const monitorPerformance = () => {
  if ('web-vital' in navigator) {
    // Monitor Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('LCP:', entry.renderTime || entry.loadTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay (FID)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingDuration);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Monitor Cumulative Layout Shift (CLS)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          console.log('CLS:', entry.value);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

export default SEOInit;
