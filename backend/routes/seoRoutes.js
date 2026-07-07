const express = require('express');
const router = express.Router();

/**
 * SEO Routes for sitemap, robots.txt, and structured data
 */

// ==================== SITEMAP ====================
router.get('/sitemap.xml', (req, res) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
  
  <!-- Homepage -->
  <url>
    <loc>https://simoncees-fintech.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <mobile:mobile/>
  </url>
  
  <!-- Authentication Pages -->
  <url>
    <loc>https://simoncees-fintech.com/login</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>https://simoncees-fintech.com/signup</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>
  
  <!-- Dashboard Pages -->
  <url>
    <loc>https://simoncees-fintech.com/dashboard</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>https://simoncees-fintech.com/dashboard/analytics</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>https://simoncees-fintech.com/dashboard/transactions</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>https://simoncees-fintech.com/dashboard/revenue</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    <mobile:mobile/>
  </url>
</urlset>`;

  res.type('application/xml');
  res.send(sitemap);
});

// ==================== ROBOTS.TXT ====================
router.get('/robots.txt', (req, res) => {
  const robots = `# Robots.txt for Simoncees FinTech
# Generated for SEO optimization

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*.json$
Crawl-delay: 2

# Google-specific
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Bing-specific
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Sitemap location
Sitemap: https://simoncees-fintech.com/sitemap.xml

# Block bad bots
User-agent: AhrefsBot
User-agent: SemrushBot
User-agent: DotBot
Disallow: /`;

  res.type('text/plain');
  res.send(robots);
});

// ==================== STRUCTURED DATA ====================
router.get('/seo/organization-schema', (req, res) => {
  const schema = {
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
    },
  };
  
  res.json(schema);
});

// ==================== SEO METADATA ====================
router.get('/seo/metadata', (req, res) => {
  const metadata = {
    site: {
      name: 'Simoncees FinTech',
      title: 'Simoncees FinTech - Financial Management & M-Pesa Integration Solutions',
      description: 'Comprehensive fintech solutions for financial management, M-Pesa integration, analytics, and revenue optimization.',
      keywords: 'fintech, financial management, M-Pesa, payment solutions, analytics',
      url: 'https://simoncees-fintech.com',
      locale: 'en_KE',
      image: 'https://simoncees-fintech.com/output.svg',
    },
    social: {
      twitter: '@simoncees',
      facebook: 'simoncees',
      linkedin: 'simoncees',
    },
    contact: {
      email: 'support@simoncees-fintech.com',
      phone: '+254-XXX-XXX-XXX',
    },
  };
  
  res.json(metadata);
});

module.exports = router;
