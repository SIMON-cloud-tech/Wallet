/**
 * SEO Utility - Dynamic meta tag management for React
 * Handles title, description, OG tags, and structured data
 */

export const updateMetaTags = ({
  title,
  description,
  keywords,
  canonical = 'https://simoncees-fintech.com',
  ogImage = 'https://simoncees-fintech.com/output.svg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  robots = 'index, follow',
}) => {
  // Update document title
  document.title = title ? `${title} | Simoncees FinTech` : 'Simoncees FinTech';

  // Update or create meta tags
  updateOrCreateMetaTag('name', 'description', description);
  updateOrCreateMetaTag('name', 'keywords', keywords);
  updateOrCreateMetaTag('name', 'robots', robots);

  // Open Graph tags
  updateOrCreateMetaTag('property', 'og:title', title || 'Simoncees FinTech');
  updateOrCreateMetaTag('property', 'og:description', description);
  updateOrCreateMetaTag('property', 'og:image', ogImage);
  updateOrCreateMetaTag('property', 'og:type', ogType);
  updateOrCreateMetaTag('property', 'og:url', canonical);

  // Twitter tags
  updateOrCreateMetaTag('name', 'twitter:card', twitterCard);
  updateOrCreateMetaTag('name', 'twitter:title', title || 'Simoncees FinTech');
  updateOrCreateMetaTag('name', 'twitter:description', description);
  updateOrCreateMetaTag('name', 'twitter:image', ogImage);

  // Canonical URL
  const link = document.querySelector("link[rel='canonical']") || document.createElement('link');
  link.rel = 'canonical';
  link.href = canonical;
  if (!link.parentNode) document.head.appendChild(link);
};

const updateOrCreateMetaTag = (attribute, value, content) => {
  if (!content) return;
  
  let tag = document.querySelector(`meta[${attribute}="${value}"]`);
  
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }
  
  tag.setAttribute('content', content);
};

/**
 * Add structured data (JSON-LD) to page
 */
export const addStructuredData = (data) => {
  let script = document.querySelector('script[type="application/ld+json"]');
  
  if (script) {
    script.remove();
  }
  
  const newScript = document.createElement('script');
  newScript.type = 'application/ld+json';
  newScript.textContent = JSON.stringify(data);
  document.head.appendChild(newScript);
};

/**
 * Organization structured data
 */
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Simoncees FinTech',
  url: 'https://simoncees-fintech.com',
  logo: 'https://simoncees-fintech.com/output.svg',
  description: 'Comprehensive fintech solutions for financial management and payment processing',
  sameAs: [
    'https://twitter.com/simoncees',
    'https://linkedin.com/company/simoncees',
    'https://facebook.com/simoncees',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@simoncees-fintech.com',
    telephone: '+254-XXX-XXX-XXX',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KE',
    addressLocality: 'Nairobi',
    postalCode: '',
  },
};

/**
 * Product/Service structured data for financial management
 */
export const serviceStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Fintech Financial Management Platform',
  description: 'Comprehensive financial management, analytics, and M-Pesa integration solutions',
  provider: {
    '@type': 'Organization',
    name: 'Simoncees FinTech',
    url: 'https://simoncees-fintech.com',
  },
  areaServed: 'KE',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://simoncees-fintech.com',
  },
};

/**
 * WebApplication structured data
 */
export const webApplicationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Simoncees FinTech',
  url: 'https://simoncees-fintech.com',
  applicationCategory: 'FinanceApplication',
  description: 'Financial management and M-Pesa integration platform',
  operatingSystem: 'Web-based',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KES',
  },
};

/**
 * Page-specific meta tags for dashboard
 */
export const dashboardMetaTags = {
  title: 'Dashboard',
  description: 'Manage your finances, track transactions, and analyze revenue with Simoncees FinTech dashboard.',
  keywords: 'financial dashboard, transaction tracking, revenue analytics, money management',
  robots: 'noindex, follow',
};

/**
 * Page-specific meta tags for analytics
 */
export const analyticsMetaTags = {
  title: 'Financial Analytics',
  description: 'Advanced financial analytics and reporting tools to understand your business performance.',
  keywords: 'financial analytics, business intelligence, revenue reporting, transaction analysis',
  robots: 'noindex, follow',
};

/**
 * Page-specific meta tags for login
 */
export const loginMetaTags = {
  title: 'Login',
  description: 'Secure login to your Simoncees FinTech account.',
  keywords: 'fintech login, account access, secure authentication',
  robots: 'noindex, follow',
};

/**
 * Page-specific meta tags for signup
 */
export const signupMetaTags = {
  title: 'Sign Up',
  description: 'Create your Simoncees FinTech account and start managing your finances today.',
  keywords: 'fintech signup, create account, financial management registration',
  robots: 'index, follow',
};
