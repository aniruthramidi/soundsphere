/**
 * SoundSphere RESTful API Automated Integration Test Suite
 * Powered by node:test, node:assert, and supertest
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_soundsphere_12345';
process.env.DB_PATH = ':memory:';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { initDatabase } = require('../config/database');
const { seed } = require('../config/seed');

let app;
let authToken = '';
let testUserId = 1;
let createdTrackId = null;
let createdPlaylistId = null;

test.before(async () => {
  // Initialize in-memory test database and seed with sample data
  const db = initDatabase(':memory:');
  await seed(db);
  app = require('../server');

  // Obtain auth token directly in setup
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'alex@soundsphere.io',
      password: 'Password123!'
    });

  authToken = loginRes.body.token;
  testUserId = loginRes.body.user.id;
});

test('1.1 GET / - Should return API welcome metadata', async () => {
  const res = await request(app).get('/');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.service, 'SoundSphere RESTful API');
  assert.ok(res.body.endpoints);
});

test('1.2 GET /api/v1/health - Should return operational status UP and DB latency', async () => {
  const res = await request(app).get('/api/v1/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'UP');
  assert.strictEqual(res.body.database.status, 'healthy');
  assert.ok(typeof res.body.uptimeSeconds === 'number');
});

test('1.3 GET /api/v1/unknown-route - Should return 404 AppError JSON', async () => {
  const res = await request(app).get('/api/v1/unknown-route');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.statusCode, 404);
});

test('2.1 POST /api/v1/auth/login - Should successfully log in Alex', async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'alex@soundsphere.io',
      password: 'Password123!'
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.email, 'alex@soundsphere.io');
});

test('2.2 POST /api/v1/auth/login - Should reject invalid password with 401', async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'alex@soundsphere.io',
      password: 'WrongPassword'
    });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('2.3 POST /api/v1/auth/register - Should register a new user successfully', async () => {
  const uniqueUser = `test_listener_${Date.now()}`;
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: uniqueUser,
      email: `${uniqueUser}@example.com`,
      password: 'SecurePassword123!',
      bio: 'Automated test listener'
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.username, uniqueUser);
});

test('2.4 POST /api/v1/auth/register - Should reject duplicate email with 409 Conflict', async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'another_user',
      email: 'alex@soundsphere.io',
      password: 'Password123!'
    });

  assert.strictEqual(res.status, 409);
  assert.strictEqual(res.body.success, false);
});

test('2.5 POST /api/v1/auth/register - Should reject invalid inputs with 422 Unprocessable Entity', async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'ab', // too short (< 3 chars)
      email: 'not-an-email',
      password: '123' // too short (< 6 chars)
    });

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.body.success, false);
  assert.ok(Array.isArray(res.body.details));
});

test('2.6 GET /api/v1/auth/me - Should return current user with valid Bearer token', async () => {
  const res = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.user.id, testUserId);
  assert.strictEqual(res.body.user.email, 'alex@soundsphere.io');
});

test('2.7 GET /api/v1/auth/me - Should reject request with 401 when token is missing', async () => {
  const res = await request(app).get('/api/v1/auth/me');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('2.8 PUT /api/v1/auth/profile - Should update profile bio successfully', async () => {
  const res = await request(app)
    .put('/api/v1/auth/profile')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      bio: 'Updated bio: Electronic music fan and software tester.'
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.user.bio, 'Updated bio: Electronic music fan and software tester.');
});

test('3.1 GET /api/v1/tracks - Should return paginated track catalog', async () => {
  const res = await request(app).get('/api/v1/tracks?page=1&limit=10');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.count, 10);
  assert.strictEqual(res.body.total, 15);
  assert.strictEqual(res.body.page, 1);
  assert.strictEqual(res.body.totalPages, 2);
});

test('3.2 GET /api/v1/tracks?q=cyberspace - Should filter tracks by search keyword', async () => {
  const res = await request(app).get('/api/v1/tracks?q=cyberspace');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.count, 1);
  assert.strictEqual(res.body.data[0].title, 'Midnight Cyberspace');
});

test('3.3 GET /api/v1/tracks?genre=Classical - Should filter tracks by genre', async () => {
  const res = await request(app).get('/api/v1/tracks?genre=Classical');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.count >= 2);
  res.body.data.forEach((track) => {
    assert.strictEqual(track.genre, 'Classical');
  });
});

test('3.4 GET /api/v1/tracks/trending - Should return top trending tracks ordered by plays', async () => {
  const res = await request(app).get('/api/v1/tracks/trending?limit=3');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.count, 3);
  assert.ok(res.body.data[0].plays >= res.body.data[1].plays);
});

test('3.5 GET /api/v1/tracks/genres - Should return distinct genres and counts', async () => {
  const res = await request(app).get('/api/v1/tracks/genres');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);
  assert.ok(res.body.data[0].genre);
  assert.ok(res.body.data[0].track_count >= 1);
});

test('3.6 GET /api/v1/tracks/1 - Should return single track details', async () => {
  const res = await request(app).get('/api/v1/tracks/1');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.id, 1);
  assert.strictEqual(res.body.data.title, 'Midnight Cyberspace');
});

test('3.7 GET /api/v1/tracks/9999 - Should return 404 for non-existent track ID', async () => {
  const res = await request(app).get('/api/v1/tracks/9999');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

test('3.8 POST /api/v1/tracks - Should create a new track (Authenticated)', async () => {
  const res = await request(app)
    .post('/api/v1/tracks')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'Neon Odyssey',
      artist: 'Alex Vance & SynthLab',
      album: 'Cosmic Horizons',
      genre: 'Electronic',
      duration: 210,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
      description: 'New synth track created during automated testing',
      release_year: 2026
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Neon Odyssey');
  createdTrackId = res.body.data.id;
});

test('3.9 POST /api/v1/tracks/:id/play - Should increment track play count', async () => {
  const beforeRes = await request(app).get(`/api/v1/tracks/${createdTrackId}`);
  const beforePlays = beforeRes.body.data.plays;

  const res = await request(app).post(`/api/v1/tracks/${createdTrackId}/play`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.plays, beforePlays + 1);
});

test('3.10 POST /api/v1/tracks/:id/like - Should toggle like status for user', async () => {
  const likeRes = await request(app)
    .post(`/api/v1/tracks/${createdTrackId}/like`)
    .set('Authorization', `Bearer ${authToken}`);
  assert.strictEqual(likeRes.status, 200);
  assert.strictEqual(likeRes.body.liked, true);

  const unlikeRes = await request(app)
    .post(`/api/v1/tracks/${createdTrackId}/like`)
    .set('Authorization', `Bearer ${authToken}`);
  assert.strictEqual(unlikeRes.status, 200);
  assert.strictEqual(unlikeRes.body.liked, false);
});

test('3.11 PUT /api/v1/tracks/:id - Should update track metadata', async () => {
  const res = await request(app)
    .put(`/api/v1/tracks/${createdTrackId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'Neon Odyssey (Remastered Edition)'
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.title, 'Neon Odyssey (Remastered Edition)');
});

test('3.12 DELETE /api/v1/tracks/:id - Should delete the track', async () => {
  const res = await request(app)
    .delete(`/api/v1/tracks/${createdTrackId}`)
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  const checkRes = await request(app).get(`/api/v1/tracks/${createdTrackId}`);
  assert.strictEqual(checkRes.status, 404);
});

test('4.1 GET /api/v1/playlists - Should list public playlists', async () => {
  const res = await request(app).get('/api/v1/playlists');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.length >= 4);
  assert.strictEqual(res.body.data[0].id, 'pl-1');
});

test('4.2 POST /api/v1/playlists - Should create a new user playlist', async () => {
  const res = await request(app)
    .post('/api/v1/playlists')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'Deep Focus Coding',
      description: 'Ambient and electronic tracks for intense concentration',
      is_public: true,
      trackIds: [1, 2, 8]
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Deep Focus Coding');
  assert.strictEqual(res.body.data.trackCount, 3);
  createdPlaylistId = res.body.data.id;
});

test('4.3 GET /api/v1/playlists/:id - Should get playlist with populated track list', async () => {
  const res = await request(app).get(`/api/v1/playlists/${createdPlaylistId}`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.id, createdPlaylistId);
  assert.strictEqual(res.body.data.tracks.length, 3);
  assert.strictEqual(res.body.data.tracks[0].title, 'Midnight Cyberspace');
});

test('4.4 POST /api/v1/playlists/:id/tracks - Should add a track to playlist', async () => {
  const res = await request(app)
    .post(`/api/v1/playlists/${createdPlaylistId}/tracks`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ track_id: 3 });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.trackCount, 4);
});

test('4.5 POST /api/v1/playlists/:id/tracks - Should reject duplicate track addition with 409', async () => {
  const res = await request(app)
    .post(`/api/v1/playlists/${createdPlaylistId}/tracks`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ track_id: 3 });

  assert.strictEqual(res.status, 409);
  assert.strictEqual(res.body.success, false);
});

test('4.6 DELETE /api/v1/playlists/:id/tracks/:trackId - Should remove track from playlist', async () => {
  const res = await request(app)
    .delete(`/api/v1/playlists/${createdPlaylistId}/tracks/3`)
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.trackCount, 3);
});

test('4.7 DELETE /api/v1/playlists/:id - Should delete playlist successfully', async () => {
  const res = await request(app)
    .delete(`/api/v1/playlists/${createdPlaylistId}`)
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
});

test('5.1 GET /api/v1/favorites - Should retrieve user favorite tracks', async () => {
  const res = await request(app)
    .get('/api/v1/favorites')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

test('5.2 GET /api/v1/favorites/check/:trackId - Should check if track is favorited', async () => {
  const res = await request(app)
    .get('/api/v1/favorites/check/1')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.trackId, 1);
  assert.strictEqual(res.body.liked, true);
});

test('6.1 GET /api/v1/analytics/dashboard - Should calculate listening metrics correctly', async () => {
  const res = await request(app)
    .get('/api/v1/analytics/dashboard')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  const { stats, recentlyPlayed, recommendations } = res.body.data;

  assert.ok(stats.songsPlayed >= 1);
  assert.ok(typeof stats.hoursListened === 'number');
  assert.ok(stats.favoriteGenre);
  assert.ok(Array.isArray(recentlyPlayed));
  assert.ok(Array.isArray(recommendations));
});

test('6.2 GET /api/v1/analytics/history - Should return paginated listening logs', async () => {
  const res = await request(app)
    .get('/api/v1/analytics/history?page=1&limit=5')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.count <= 5);
  assert.ok(res.body.total >= 1);
});
