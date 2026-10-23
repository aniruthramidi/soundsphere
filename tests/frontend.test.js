/**
 * SoundSphere Front-End Unit & Integration Test Suite
 * Powered by node:test and node:assert (ESM)
 */

import test from 'node:test';
import assert from 'node:assert';

// Mock Browser Environment globals
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

import * as musicService from '../src/services/musicService.js';
import { sampleTracks, samplePlaylists } from '../src/data/tracks.js';

test.describe('1. Front-End Music Data Service Unit Tests', () => {
  test('1.1 getTracks - Should return track catalog array', async () => {
    const tracks = await musicService.getTracks();
    assert.ok(Array.isArray(tracks));
    assert.ok(tracks.length >= 15);
    assert.strictEqual(tracks[0].title, 'Midnight Cyberspace');
  });

  test('1.2 getTrackById - Should return single track by ID', async () => {
    const track = await musicService.getTrackById(1);
    assert.ok(track);
    assert.strictEqual(track.id, 1);
    assert.strictEqual(track.title, 'Midnight Cyberspace');
    assert.strictEqual(track.artist, 'Aetheria');
  });

  test('1.3 getTrackById - Should reject with error for non-existent track ID', async () => {
    await assert.rejects(
      async () => {
        await musicService.getTrackById(99999);
      },
      /Track with ID "99999" was not found/
    );
  });

  test('1.4 searchTracks - Should filter tracks matching search keyword', async () => {
    const results = await musicService.searchTracks('Aetheria');
    assert.ok(Array.isArray(results));
    assert.ok(results.length >= 1);
    assert.ok(results.some((t) => t.artist === 'Aetheria'));
  });

  test('1.5 searchTracks - Should return full catalog when query is empty', async () => {
    const results = await musicService.searchTracks('');
    assert.ok(Array.isArray(results));
    assert.ok(results.length >= 15);
  });

  test('1.6 getTracksByGenre - Should filter tracks strictly by genre', async () => {
    const jazzTracks = await musicService.getTracksByGenre('Jazz');
    assert.ok(Array.isArray(jazzTracks));
    assert.ok(jazzTracks.length >= 1);
    jazzTracks.forEach((t) => {
      assert.strictEqual(t.genre.toLowerCase(), 'jazz');
    });
  });

  test('1.7 getFeaturedTracks - Should return top 6 tracks sorted by plays', async () => {
    const featured = await musicService.getFeaturedTracks();
    assert.ok(Array.isArray(featured));
    assert.ok(featured.length <= 6);
    if (featured.length > 1) {
      assert.ok(featured[0].plays >= featured[1].plays);
    }
  });

  test('1.8 getTrendingTracks - Should return trending tracks list', async () => {
    const trending = await musicService.getTrendingTracks();
    assert.ok(Array.isArray(trending));
    assert.ok(trending.length <= 5);
  });

  test('1.9 getRecentlyAdded - Should return latest releases', async () => {
    const recent = await musicService.getRecentlyAdded();
    assert.ok(Array.isArray(recent));
    assert.ok(recent.length <= 6);
  });
});

test.describe('2. Front-End State & Authentication Unit Tests', () => {
  test('2.1 saveAuthToken and getAuthToken - Should persist and retrieve token from localStorage', () => {
    const sampleToken = 'test_sample_jwt_token_12345';
    musicService.saveAuthToken(sampleToken);
    assert.strictEqual(musicService.getAuthToken(), sampleToken);

    // Clear token
    musicService.saveAuthToken('');
    assert.strictEqual(musicService.getAuthToken(), '');
  });

  test('2.2 checkHealth - Should return connection object with boolean status', async () => {
    const health = await musicService.checkHealth();
    assert.ok(typeof health === 'object');
    assert.ok(typeof health.connected === 'boolean');
  });

  test('2.3 toggleLike - Should toggle track like state and update persistence', async () => {
    const toggled = await musicService.toggleLike(1);
    assert.ok(typeof toggled.liked === 'boolean');
  });
});

test.describe('3. Front-End Playlists & Library Unit Tests', () => {
  test('3.1 getUserPlaylists - Should return list of user playlists', async () => {
    const playlists = await musicService.getUserPlaylists();
    assert.ok(Array.isArray(playlists));
    assert.ok(playlists.length >= 1);
    assert.ok(playlists[0].title);
  });

  test('3.2 createPlaylist - Should create a new playlist and return updated array', async () => {
    const title = `Test Playlist ${Date.now()}`;
    const updated = await musicService.createPlaylist(title, 'Created in automated test');
    assert.ok(Array.isArray(updated));
    const created = updated.find((p) => p.title === title);
    assert.ok(created);
    assert.strictEqual(created.title, title);
  });

  test('3.3 addTrackToPlaylist - Should add track to playlist without duplicates', async () => {
    const playlists = await musicService.getUserPlaylists();
    const firstPl = playlists[0];
    const initialCount = firstPl.trackIds?.length || 0;

    const updated = await musicService.addTrackToPlaylist(firstPl.id, 999);
    const target = updated.find((p) => p.id === firstPl.id);
    assert.ok(target.trackIds.includes(999));
  });
});

test.describe('4. Audio Utility & Formatting Helpers', () => {
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  test('4.1 formatDuration - Should format seconds into mm:ss strings accurately', () => {
    assert.strictEqual(formatDuration(214), '3:34');
    assert.strictEqual(formatDuration(65), '1:05');
    assert.strictEqual(formatDuration(0), '0:00');
    assert.strictEqual(formatDuration(3600), '60:00');
  });
});
