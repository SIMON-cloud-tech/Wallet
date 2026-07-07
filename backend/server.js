// ==================== PACKAGES ====================
const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// ==================== ROUTES ====================
const authRoutes = require('./routes/authRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const resetRoutes = require('./routes/resetRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const mpesaRoutes = require('./routes/mpesaRoutes');
const seoRoutes = require('./routes/seoRoutes');

// ==================== APP INIT ====================
const app = express();
app.set('trust proxy', 1);
// ==================== SECURITY & SEO MIDDLEWARE ====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(hpp());
app.use(express.json({ limit: '2mb' }));
app.use(express.static('public', { maxAge: '1d' }));

// ==================== SEO HEADERS MIDDLEWARE ====================
app.use((req, res, next) => {
  // Cache control for static assets
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    res.set('Cache-Control', 'public, max-age=604800, immutable');
  } else {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  // SEO headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

// ==================== RATE LIMITERS ====================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts'
});

const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests'
});

const revenueLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests'
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many reset attempts'
});

// Apply rate limiters
app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/analytics', analyticsLimiter);
app.use('/api/revenue', revenueLimiter);
app.use('/api/reset', resetLimiter);

// ==================== ROUTES ====================
app.use('/', seoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/mpesa', mpesaRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend running' });
});

// ─── Serve React Frontend in Production ────
if (process.env.NODE_ENV === 'production') {
  // Serve the static files from the Vite build
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

  // Catch‑all for React Router – send index.html for any non‑API route
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

// ==================== DATABASE + SERVER ====================
const PORT = process.env.PORT || 5000;

// Connect to DB first, then start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
  })
  .catch(err => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });