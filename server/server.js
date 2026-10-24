/**
 * SoundSphere Music Streaming Web Application
 * RESTful Backend API Server Entry Point
 * Production-Ready, Secure, and Container-Enabled
 */

const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { initDatabase, getDb } = require('./config/database');
const { seed } = require('./config/seed');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Route Imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Swagger Document
const swaggerDocument = require('./docs/swagger.json');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Database Connection & Tables
const db = initDatabase();

// In non-test environments, ensure database is initialized with initial seed data if empty
if (process.env.NODE_ENV !== 'test') {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount && userCount.count === 0) {
      console.log('🔄 Fresh database detected. Auto-seeding initial users and tracks...');
      seed(db).catch(err => console.error('Seeding error:', err));
    }
  } catch (err) {
    console.warn('Auto-seed check note:', err.message);
  }
}

// Production & Static Files Configuration
const distPath = path.resolve(__dirname, '../dist');
const hasStaticDist = fs.existsSync(distPath);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline Swagger UI scripts and remote artwork CDNs
    crossOriginEmbedderPolicy: false
  })
);

// Dynamic CORS configuration (supports production domain whitelisting)
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Serve static frontend build if present
if (hasStaticDist && process.env.NODE_ENV !== 'test') {
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true
  }));
}

// API Root Landing & Quick Info Payload
const apiWelcomePayload = {
  service: 'SoundSphere RESTful API',
  version: '1.0.0',
  description: 'Commercial-grade backend services for SoundSphere Music Streaming platform',
  documentation: '/api/docs',
  endpoints: {
    health: '/api/v1/health',
    auth: '/api/v1/auth',
    tracks: '/api/v1/tracks',
    playlists: '/api/v1/playlists',
    favorites: '/api/v1/favorites',
    analytics: '/api/v1/analytics'
  }
};

// Explicit API Info Endpoint
app.get('/api', (req, res) => {
  res.status(200).json(apiWelcomePayload);
});

// Root Route - Serves SPA index.html in production, or JSON API metadata for tests / API consumers
app.get('/', (req, res, next) => {
  if (process.env.NODE_ENV === 'test' || req.headers.accept?.includes('application/json') || !hasStaticDist) {
    return res.status(200).json(apiWelcomePayload);
  }
  return res.sendFile(path.join(distPath, 'index.html'));
});

// Swagger Interactive API Documentation UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'SoundSphere API Documentation',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Apply Rate Limiting
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// API v1 Routing
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tracks', trackRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Client Single Page Application (SPA) Fallback Route for non-API GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  if (hasStaticDist && process.env.NODE_ENV !== 'test') {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// 404 Route Catch-all for unhandled API requests
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server if executed directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`\n🎧 SoundSphere REST API running on http://localhost:${PORT}`);
    console.log(`📖 Interactive API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`💚 System Health Check: http://localhost:${PORT}/api/v1/health\n`);
    if (hasStaticDist) {
      console.log(`🌐 Production Frontend SPA served from: ${distPath}`);
    }
  });

  const handleShutdown = () => {
    console.log('\nGracefully shutting down SoundSphere server...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

module.exports = app;
