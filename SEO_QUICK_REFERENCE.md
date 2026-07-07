# SEO Quick Reference Guide

## 📌 Most Common Tasks

### Add SEO to a New Page
```jsx
import { useSEO } from '../hooks/useSEO';

export default function MyPage() {
  useSEO({
    title: 'Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2, keyword3',
    canonical: 'https://yourdomain.com/page',
    robots: 'index, follow', // or 'noindex, follow' for protected pages
  });

  return (
    <div>
      <h1>Page Title</h1>
      {/* Page content */}
    </div>
  );
}
```

### Add Structured Data
```jsx
useSEO({
  title: 'My Page',
  description: 'Page description',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home' },
      { '@type': 'ListItem', position: 2, name: 'My Page' }
    ]
  }
});
```

### Add Images with Alt Text
```jsx
<img 
  src="revenue-chart.png" 
  alt="Monthly revenue chart showing 25% increase from Q1 to Q2 2026"
  loading="lazy"
/>
```

### Verify Setup on a Page
```javascript
// In browser console on your page:
document.title // Check title
document.querySelector('meta[name="description"]').content
document.querySelector('link[rel="canonical"]').href
document.querySelectorAll('meta[property="og:*"]') // Check OG tags
```

---

## 📋 Pre-built Configurations

### Use Existing Page Config
```jsx
import { getPageConfig } from '../config/pageConfigs';
import { useSEO } from '../hooks/useSEO';

export default function Dashboard() {
  const config = getPageConfig('dashboard');
  useSEO(config);
  // ...
}
```

### Available Configs
- `pageConfigs.home`
- `pageConfigs.login`
- `pageConfigs.signup`
- `pageConfigs.dashboard`
- `pageConfigs.analytics`
- `pageConfigs.transactions`
- `pageConfigs.revenue`
- `pageConfigs.allocations`
- `pageConfigs.settings`

---

## 🏗️ File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── PageWrapper.jsx          ← Wrapper for pages
│   │   └── SEOInit.jsx              ← Initialize app SEO
│   ├── hooks/
│   │   └── useSEO.js                ← Main SEO hook
│   ├── config/
│   │   └── pageConfigs.js           ← Page configurations
│   └── utils/
│       ├── seoUtils.js              ← SEO utilities
│       └── performanceMonitoring.js ← Performance tracking
├── public/
│   ├── robots.txt                   ← Search engine rules
│   └── sitemap.xml                  ← Site structure
└── index.html                        ← Meta tags here

backend/
├── routes/
│   └── seoRoutes.js                 ← Sitemap/robots endpoints
└── server.js                         ← SEO headers
```

---

## 🎯 SEO Best Practices Quick Tips

### Title Tags
✓ 50-60 characters  
✓ Include main keyword  
✓ Include brand name  
✓ Be compelling  

❌ Don't: "Page"  
❌ Don't: Stuff keywords  
❌ Don't: Make it too long

### Meta Descriptions
✓ 155-160 characters  
✓ Include keyword  
✓ Call-to-action  
✓ Unique per page  

❌ Don't: Duplicate descriptions  
❌ Don't: Make it too short  
❌ Don't: Miss keyword

### Content
✓ One H1 per page  
✓ Logical heading hierarchy  
✓ Descriptive alt text  
✓ Internal links  

❌ Don't: Multiple H1s  
❌ Don't: Skip heading structure  
❌ Don't: Generic alt text  
❌ Don't: Keyword stuffing

---

## 🔧 Common Imports

```jsx
// SEO Hook
import { useSEO } from '../hooks/useSEO';

// Page Wrapper
import PageWrapper from '../components/PageWrapper';

// Utilities
import { 
  updateMetaTags, 
  addStructuredData,
  organizationStructuredData,
  serviceStructuredData,
} from '../utils/seoUtils';

// Page Configs
import { getPageConfig, getCanonicalUrl, getOGImage } from '../config/pageConfigs';

// Performance
import { trackCoreWebVitals } from '../utils/performanceMonitoring';
```

---

## 🚀 Quick Setup Steps

1. **Import useSEO hook:**
   ```jsx
   import { useSEO } from '../hooks/useSEO';
   ```

2. **Call hook with page info:**
   ```jsx
   useSEO({
     title: 'Page Title',
     description: 'Page description',
     keywords: 'keyword1, keyword2',
   });
   ```

3. **Add proper heading:**
   ```jsx
   <h1>Page Title</h1>
   ```

4. **Add alt text to images:**
   ```jsx
   <img src="image.png" alt="Descriptive text" />
   ```

5. **Done!** ✓

---

## 📊 SEO Metrics to Track

### Core Web Vitals
- **LCP**: Page load - Target < 2.5s
- **INP**: Interactivity - Target < 200ms
- **CLS**: Visual stability - Target < 0.1

### Search Performance
- **Impressions**: How often shown in search
- **Clicks**: How often clicked from search
- **CTR**: Click-through rate (clicks/impressions)
- **Avg. Position**: Average ranking position

### Technical
- **Indexed Pages**: Pages in search index
- **Errors**: Crawl and indexation errors
- **Coverage**: Pages successfully crawled
- **Speed**: Page load time

---

## 🐛 Debug Checklist

- [ ] Title tag set correctly
- [ ] Meta description present
- [ ] Canonical URL correct
- [ ] H1 tag present and unique
- [ ] Alt text on images
- [ ] Mobile responsive
- [ ] No 404 errors
- [ ] No console errors
- [ ] Performance good
- [ ] Open Graph tags valid

---

## 📱 Responsive Design Tips

```jsx
// Ensure viewport meta in index.html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

// Use CSS media queries
@media (max-width: 768px) {
  /* Mobile styles */
}

// Test on real devices
// Test with Google Mobile-Friendly Test
```

---

## 🎨 Component Usage Examples

### Simple Page with SEO
```jsx
import { useSEO } from '../hooks/useSEO';

export default function About() {
  useSEO({
    title: 'About Us',
    description: 'Learn about Simoncees FinTech',
    keywords: 'about us, company, fintech',
  });

  return (
    <section>
      <h1>About Us</h1>
      <p>Company information...</p>
    </section>
  );
}
```

### Page with Complex Structured Data
```jsx
import { useSEO } from '../hooks/useSEO';

export default function Services() {
  useSEO({
    title: 'Services',
    description: 'Our fintech services',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Simoncees FinTech',
      serviceArea: 'KE',
      offers: {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'M-Pesa Integration',
        }
      }
    }
  });

  return (
    <section>
      <h1>Services</h1>
      {/* Services content */}
    </section>
  );
}
```

### Protected Page (Dashboard)
```jsx
import { useSEO } from '../hooks/useSEO';

export default function Dashboard() {
  useSEO({
    title: 'Dashboard',
    description: 'Your financial dashboard',
    robots: 'noindex, follow', // Don't index user dashboards
  });

  return (
    <section>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </section>
  );
}
```

---

## 🔗 Useful Links

- **Google Search Console**: https://search.google.com/search-console/
- **Structured Data Tester**: https://search.google.com/test/rich-results
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Page Speed Insights**: https://pagespeed.web.dev/
- **Schema.org Validator**: https://validator.schema.org/

---

## 💡 Pro Tips

1. **Use page configs** instead of hardcoding meta tags
2. **Test on mobile** before declaring a page complete
3. **Monitor Core Web Vitals** regularly
4. **Update content** at least monthly for better freshness
5. **Build internal links** to help crawlers understand structure
6. **Use descriptive anchor text** in internal links
7. **Keep URLs short and descriptive**
8. **Avoid spaces in URLs** - use hyphens instead
9. **Implement breadcrumbs** for better navigation
10. **Monitor GSC** for new crawl errors

---

## ⚠️ Common Mistakes to Avoid

- ❌ Using same title on multiple pages
- ❌ Using same description on multiple pages
- ❌ Forgetting meta description entirely
- ❌ Keyword stuffing in content
- ❌ No mobile optimization
- ❌ Broken internal links
- ❌ Duplicate content
- ❌ Ignoring performance metrics
- ❌ No structured data
- ❌ Blocking pages in robots.txt that should be indexed

---

## 📞 Quick Help

**Forgot the hook name?** → `useSEO`  
**Want page wrapper?** → `PageWrapper`  
**Need utilities?** → Check `seoUtils.js`  
**Page configs?** → Import from `pageConfigs.js`  
**Need info?** → Check `SEO_IMPLEMENTATION.md`  
**Full checklist?** → See `SEO_CHECKLIST.md`

---

**Last Updated**: 2026-07-07  
**Version**: 1.0  
**Status**: Ready to Use
