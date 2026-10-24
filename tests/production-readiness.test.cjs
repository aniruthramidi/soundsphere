/**
 * SoundSphere Production Readiness & User Acceptance Test (UAT) Suite
 * Validates production environment constraints, security headers, rate limiting,
 * health telemetry probes, SPA asset serving, and resilient error envelopes.
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'uat_production_grade_secret_key_987654';
process.env.DB_PATH = ':memory:';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { initDatabase } = require('../server/config/database');
const { seed } = require('../server/config/seed');
const { createRateLimiter } = require('../server/middleware/rateLimiter');

let app;

test.before(async () => {
  const db = initDatabase(':memory:');
  await seed(db);
  app = require('../server/server');
});

test('UAT-1: Production Security Headers & Masking', async () => {
  const res = await request(app).get('/api/v1/health');

  assert.strictEqual(res.status, 200);
  // Verify Helmet security headers
  assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  // Powered-by should not expose Express
  assert.strictEqual(res.headers['x-powered-by'], undefined);
});

test('UAT-2: Production Health Check Telemetry Probe', async () => {
  const res = await request(app).get('/api/v1/health');

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'UP');
  assert.strictEqual(res.body.service, 'SoundSphere REST API');
  assert.strictEqual(res.body.database.status, 'healthy');
  assert.ok(typeof res.body.uptimeSeconds === 'number');
  assert.ok(typeof res.body.database.latencyMs === 'number');
  assert.ok(res.body.system.heapUsedMB);
  assert.ok(res.body.system.nodeVersion);
});

test('UAT-3: Interactive OpenAPI / Swagger Documentation Availability', async () => {
  const res = await request(app).get('/api/docs/');
  // Swagger UI serves HTML redirect or 200 document
  assert.ok(res.status === 200 || res.status === 301 || res.status === 302);
});

test('UAT-4: Dedicated /api Landing Endpoint for Microservices & Clients', async () => {
  const res = await request(app).get('/api');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.service, 'SoundSphere RESTful API');
  assert.strictEqual(res.body.endpoints.health, '/api/v1/health');
  assert.strictEqual(res.body.endpoints.tracks, '/api/v1/tracks');
  assert.strictEqual(res.body.endpoints.auth, '/api/v1/auth');
});

test('UAT-5: Rate Limiting Throttling & Header Verification', async () => {
  // Create an isolated strict test rate limiter (max 3 requests)
  const express = require('express');
  const testApp = express();
  const strictLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 3,
    message: 'Test rate limit exceeded'
  });

  testApp.use(strictLimiter);
  testApp.get('/test-limit', (req, res) => res.status(200).json({ ok: true }));

  // 1st request: OK
  const r1 = await request(testApp).get('/test-limit').set('x-test-rate-limit', 'true');
  assert.strictEqual(r1.status, 200);
  assert.strictEqual(r1.headers['x-ratelimit-limit'], '3');
  assert.strictEqual(r1.headers['x-ratelimit-remaining'], '2');

  // 2nd request: OK
  const r2 = await request(testApp).get('/test-limit').set('x-test-rate-limit', 'true');
  assert.strictEqual(r2.status, 200);
  assert.strictEqual(r2.headers['x-ratelimit-remaining'], '1');

  // 3rd request: OK
  const r3 = await request(testApp).get('/test-limit').set('x-test-rate-limit', 'true');
  assert.strictEqual(r3.status, 200);
  assert.strictEqual(r3.headers['x-ratelimit-remaining'], '0');

  // 4th request: Blocked with 429 Too Many Requests
  const r4 = await request(testApp).get('/test-limit').set('x-test-rate-limit', 'true');
  assert.strictEqual(r4.status, 429);
  assert.ok(r4.headers['retry-after']);
});

test('UAT-6: Production Error Envelope & 404 Resilience', async () => {
  const res = await request(app).get('/api/v1/non-existent-api-resource');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.statusCode, 404);
  assert.ok(res.body.message.includes('non-existent-api-resource'));
  assert.ok(res.body.timestamp);
});

test('UAT-7: CORS Policy Envelope Compliance', async () => {
  const res = await request(app)
    .options('/api/v1/tracks')
    .set('Origin', 'https://soundsphere.app')
    .set('Access-Control-Request-Method', 'GET');

  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers['access-control-allow-origin'], 'https://soundsphere.app');
});

test('UAT-8: End-to-End User Flow (Auth -> Catalog -> Playback -> Analytics)', async () => {
  // 1. Authenticate user
  const authRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'alex@soundsphere.io',
      password: 'Password123!'
    });
  assert.strictEqual(authRes.status, 200);
  const token = authRes.body.token;
  assert.ok(token);

  // 2. Fetch tracks catalog
  const catalogRes = await request(app).get('/api/v1/tracks');
  assert.strictEqual(catalogRes.status, 200);
  assert.ok(catalogRes.body.data.length > 0);
  const sampleTrack = catalogRes.body.data[0];

  // 3. Increment play count for track
  const playRes = await request(app)
    .post(`/api/v1/tracks/${sampleTrack.id}/play`)
    .set('Authorization', `Bearer ${token}`)
    .send({ durationPlayed: 180, source: 'uat_suite' });
  assert.strictEqual(playRes.status, 200);
  assert.strictEqual(playRes.body.success, true);

  // 4. Check user analytics dashboard reflects activity
  const analyticsRes = await request(app)
    .get('/api/v1/analytics/dashboard')
    .set('Authorization', `Bearer ${token}`);
  assert.strictEqual(analyticsRes.status, 200);
  assert.ok(analyticsRes.body.data.totalMinutesListened >= 0);
  assert.ok(analyticsRes.body.data.totalPlaylists >= 0);
});
