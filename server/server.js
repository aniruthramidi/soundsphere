/**
 * SoundSphere Music Streaming Web Application
 * RESTful Backend API Server Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('node:path');
const swaggerUi = require('swagger-ui-express');

const { initDatabase } = require('./config/database');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

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
const PORT = process.env.PORT || 5000;

// Initialize Database Connection & Tables
initDatabase();

// Security and Utility Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false // Allows inline Swagger UI scripts/styles
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Root Landing & Quick Info
app.get('/', (req, res) => {
  res.status(200).json({
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
  });
});

// Swagger Interactive API Documentation UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'SoundSphere API Documentation',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// API v1 Routing
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tracks', trackRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 Route Catch-all
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server if executed directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`\n🎧 SoundSphere REST API running on http://localhost:${PORT}`);
    console.log(`📖 Interactive API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`💚 System Health Check: http://localhost:${PORT}/api/v1/health\n`);
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
