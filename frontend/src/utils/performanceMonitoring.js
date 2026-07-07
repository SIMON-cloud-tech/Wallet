/**
 * Performance Monitoring for SEO - Core Web Vitals
 * Helps track metrics important for SEO ranking
 */

// Core Web Vitals tracking
export const trackCoreWebVitals = () => {
  // Largest Contentful Paint (LCP)
  trackLCP();
  
  // Cumulative Layout Shift (CLS)
  trackCLS();
  
  // First Input Delay (FID) - or Interaction to Next Paint (INP)
  trackINP();
  
  // First Contentful Paint (FCP)
  trackFCP();
  
  // Time to First Byte (TTFB)
  trackTTFB();
};

/**
 * Track Largest Contentful Paint (LCP)
 * Threshold: < 2.5s is good
 */
const trackLCP = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const lcp = entry.renderTime || entry.loadTime;
          console.log('LCP:', lcp, 'ms');
          
          // Send to analytics
          sendToAnalytics({
            metric: 'LCP',
            value: lcp,
            rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor',
          });
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation failed:', e);
    }
  }
};

/**
 * Track Cumulative Layout Shift (CLS)
 * Threshold: < 0.1 is good
 */
const trackCLS = () => {
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            console.log('CLS:', clsValue);
            
            // Send to analytics
            sendToAnalytics({
              metric: 'CLS',
              value: clsValue,
              rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation failed:', e);
    }
  }
};

/**
 * Track Interaction to Next Paint (INP)
 * Threshold: < 200ms is good
 */
const trackINP = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const inp = entry.processingDuration;
          console.log('INP:', inp, 'ms');
          
          // Send to analytics
          sendToAnalytics({
            metric: 'INP',
            value: inp,
            rating: inp < 200 ? 'good' : inp < 500 ? 'needs-improvement' : 'poor',
          });
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('INP observation failed:', e);
    }
  }
};

/**
 * Track First Contentful Paint (FCP)
 * Threshold: < 1.8s is good
 */
const trackFCP = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            console.log('FCP:', fcp, 'ms');
            
            // Send to analytics
            sendToAnalytics({
              metric: 'FCP',
              value: fcp,
              rating: fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor',
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP observation failed:', e);
    }
  }
};

/**
 * Track Time to First Byte (TTFB)
 * Threshold: < 600ms is good
 */
const trackTTFB = () => {
  try {
    const perfData = window.performance.timing;
    const ttfb = perfData.responseStart - perfData.navigationStart;
    console.log('TTFB:', ttfb, 'ms');
    
    // Send to analytics
    sendToAnalytics({
      metric: 'TTFB',
      value: ttfb,
      rating: ttfb < 600 ? 'good' : ttfb < 1200 ? 'needs-improvement' : 'poor',
    });
  } catch (e) {
    console.warn('TTFB tracking failed:', e);
  }
};

/**
 * Track page load time
 */
export const trackPageLoadTime = () => {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page Load Time:', pageLoadTime, 'ms');
    
    sendToAnalytics({
      metric: 'Page Load Time',
      value: pageLoadTime,
    });
  });
};

/**
 * Send metrics to analytics service
 */
const sendToAnalytics = (data) => {
  // Replace with your actual analytics endpoint
  // Example: Google Analytics, Mixpanel, custom server, etc.
  
  if (window.gtag) {
    // Google Analytics
    window.gtag('event', 'web_vital', {
      event_category: 'web_vital',
      event_label: data.metric,
      value: Math.round(data.value),
      rating: data.rating,
    });
  }
  
  // Or send to custom analytics endpoint
  // fetch('/api/analytics/metrics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // }).catch(e => console.warn('Analytics send failed:', e));
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = () => {
  const perfData = window.performance.timing;
  const perfEntries = window.performance.getEntries();
  
  return {
    navigation: perfData.navigationStart,
    requestStart: perfData.requestStart,
    responseStart: perfData.responseStart,
    responseEnd: perfData.responseEnd,
    domLoading: perfData.domLoading,
    domInteractive: perfData.domInteractive,
    domComplete: perfData.domComplete,
    loadEventStart: perfData.loadEventStart,
    loadEventEnd: perfData.loadEventEnd,
    
    // Calculated metrics
    ttfb: perfData.responseStart - perfData.navigationStart,
    fcp: findMetricByName(perfEntries, 'first-contentful-paint'),
    lcp: findLargestContentfulPaint(perfEntries),
    pageLoadTime: perfData.loadEventEnd - perfData.navigationStart,
  };
};

/**
 * Find metric by name
 */
const findMetricByName = (entries, name) => {
  const entry = entries.find(e => e.name === name);
  return entry ? entry.startTime : null;
};

/**
 * Find largest contentful paint
 */
const findLargestContentfulPaint = (entries) => {
  const lcpEntries = entries.filter(e => e.entryType === 'largest-contentful-paint');
  return lcpEntries.length > 0 
    ? lcpEntries[lcpEntries.length - 1].renderTime || lcpEntries[lcpEntries.length - 1].loadTime 
    : null;
};

// Auto-track on page load if in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      console.log('Performance Summary:', getPerformanceSummary());
    });
  }
}
