/**
 * Canonical URL and Open Graph Image Manager
 * Centralized management of canonical URLs and OG images
 */

const BASE_URL = 'https://simoncees-fintech.com';
const DEFAULT_OG_IMAGE = 'https://simoncees-fintech.com/output.svg';

/**
 * Get canonical URL for a page
 */
export const getCanonicalUrl = (path = '/') => {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

/**
 * Get OG image for a page
 * Can be customized per page if needed
 */
export const getOGImage = (pageType = 'general') => {
  const ogImages = {
    general: DEFAULT_OG_IMAGE,
    dashboard: `${BASE_URL}/og-images/dashboard.png`,
    analytics: `${BASE_URL}/og-images/analytics.png`,
    revenue: `${BASE_URL}/og-images/revenue.png`,
    transactions: `${BASE_URL}/og-images/transactions.png`,
    auth: `${BASE_URL}/og-images/auth.png`,
  };
  
  return ogImages[pageType] || ogImages.general;
};

/**
 * Page configurations with canonical URLs and meta info
 */
export const pageConfigs = {
  home: {
    path: '/',
    canonical: getCanonicalUrl('/'),
    title: 'Simoncees FinTech - Financial Management & M-Pesa Integration Solutions',
    description: 'Comprehensive fintech solutions including M-Pesa integration, financial analytics, and revenue optimization.',
    keywords: 'fintech, financial management, M-Pesa, payment solutions, analytics',
    ogImage: getOGImage('general'),
    ogType: 'website',
    robots: 'index, follow',
  },
  
  login: {
    path: '/login',
    canonical: getCanonicalUrl('/login'),
    title: 'Login',
    description: 'Secure login to your Simoncees FinTech account.',
    keywords: 'fintech login, account access, secure authentication',
    ogImage: getOGImage('auth'),
    ogType: 'website',
    robots: 'noindex, follow',
  },
  
  signup: {
    path: '/signup',
    canonical: getCanonicalUrl('/signup'),
    title: 'Sign Up',
    description: 'Create your Simoncees FinTech account and start managing your finances today.',
    keywords: 'fintech signup, create account, financial management registration',
    ogImage: getOGImage('auth'),
    ogType: 'website',
    robots: 'index, follow',
  },
  
  resetPassword: {
    path: '/reset-password',
    canonical: getCanonicalUrl('/reset-password'),
    title: 'Reset Password',
    description: 'Reset your Simoncees FinTech account password securely.',
    keywords: 'password reset, account recovery, security',
    ogImage: getOGImage('auth'),
    ogType: 'website',
    robots: 'noindex, follow',
  },
  
  dashboard: {
    path: '/dashboard',
    canonical: getCanonicalUrl('/dashboard'),
    title: 'Dashboard',
    description: 'Manage your finances, track transactions, and analyze revenue with Simoncees FinTech dashboard.',
    keywords: 'financial dashboard, transaction tracking, revenue analytics',
    ogImage: getOGImage('dashboard'),
    ogType: 'website',
    robots: 'noindex, follow',
  },
  
  analytics: {
    path: '/dashboard/analytics',
    canonical: getCanonicalUrl('/dashboard/analytics'),
    title: 'Financial Analytics',
    description: 'Advanced financial analytics and reporting tools to understand your business performance.',
    keywords: 'financial analytics, business intelligence, revenue reporting',
    ogImage: getOGImage('analytics'),
    ogType: 'website',
    robots: 'noindex, follow',
  },
  
  transactions: {
    path: '/dashboard/transactions',
    canonical: getCanonicalUrl('/dashboard/transactions'),
    title: 'Transactions',
    description: 'View and manage all your transactions with detailed insights and filtering options.',
    keywords: 'transaction management, payment history, transaction tracking',
    ogImage: getOGImage('transactions'),
    ogType: 'website',
    robots: 'noindex, follow',
  },
  
  revenue: {
    path: '/dashboard/revenue',
    canonical: getCanonicalUrl('/dashboard/revenue'),
    title: 'Revenue Management',
    description: 'Track and optimize your revenue streams with comprehensive analytics.',
    keywords: 'revenue management, income tracking, financial optimization',
    ogImage: getOGImage('revenue'),
    ogType: 'website',
    robots: 'noindex, follow',
  },
  
  allocations: {
    path: '/dashboard/allocations',
    canonical: getCanonicalUrl('/dashboard/allocations'),
    title: 'Allocations',
    description: 'Manage and configure allocation rules for your financial operations.',
    keywords: 'allocation management, fund distribution, financial rules',
    ogImage: getOGImage('dashboard'),
    ogType: 'website',
    robots: 'noindex, follow',
  },
  
  settings: {
    path: '/dashboard/settings',
    canonical: getCanonicalUrl('/dashboard/settings'),
    title: 'Settings',
    description: 'Configure your Simoncees FinTech account settings and preferences.',
    keywords: 'account settings, preferences, configuration',
    ogImage: getOGImage('dashboard'),
    ogType: 'website',
    robots: 'noindex, follow',
  },
  
  mpesa: {
    path: '/mpesa',
    canonical: getCanonicalUrl('/mpesa'),
    title: 'M-Pesa Integration',
    description: 'Seamless M-Pesa payment integration for your financial operations.',
    keywords: 'M-Pesa integration, mobile money, payment gateway',
    ogImage: getOGImage('general'),
    ogType: 'website',
    robots: 'index, follow',
  },
};

/**
 * Get page config by key
 */
export const getPageConfig = (pageKey) => {
  return pageConfigs[pageKey] || pageConfigs.home;
};

/**
 * Get all canonical URLs for sitemap generation
 */
export const getAllCanonicalUrls = () => {
  return Object.values(pageConfigs).map(config => ({
    url: config.canonical,
    title: config.title,
    priority: config.robots.includes('noindex') ? 0.5 : 0.8,
  }));
};

/**
 * Get OpenGraph tags as HTML string
 */
export const getOGTagsHTML = (pageKey) => {
  const config = getPageConfig(pageKey);
  
  return `
    <meta property="og:type" content="${config.ogType}" />
    <meta property="og:url" content="${config.canonical}" />
    <meta property="og:title" content="${config.title}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:image" content="${config.ogImage}" />
    <meta property="og:site_name" content="Simoncees FinTech" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${config.canonical}" />
    <meta name="twitter:title" content="${config.title}" />
    <meta name="twitter:description" content="${config.description}" />
    <meta name="twitter:image" content="${config.ogImage}" />
  `;
};

/**
 * Verify canonical URL is properly set
 */
export const verifyCanonical = (expectedPath) => {
  const link = document.querySelector("link[rel='canonical']");
  const expected = getCanonicalUrl(expectedPath);
  
  if (link && link.href === expected) {
    console.log(`✓ Canonical URL correct: ${expected}`);
    return true;
  } else {
    console.warn(`✗ Canonical URL mismatch. Expected: ${expected}, Got: ${link?.href}`);
    return false;
  }
};

/**
 * Export all configs as JSON for API
 */
export const getPageConfigsJSON = () => {
  return pageConfigs;
};
