/**
 * Health Check and System Status Route
 */

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

router.get('/', (req, res) => {
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const start = process.hrtime();
    const db = getDb();
    db.prepare('SELECT 1').get();
    const diff = process.hrtime(start);
    dbLatencyMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
  } catch (err) {
    dbStatus = 'unhealthy';
  }

  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'UP',
    service: 'SoundSphere REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      engine: 'SQLite (node:sqlite)',
      status: dbStatus,
      latencyMs: parseFloat(dbLatencyMs)
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
    }
  });
});

module.exports = router;
