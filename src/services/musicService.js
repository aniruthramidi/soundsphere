import { sampleTracks, samplePlaylists } from '../data/tracks.js';

// Base REST API configuration (connects to Express backend on port 5000)
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api/v1';

// Local storage key for persistent mock fallback state
const STORAGE_KEY = 'soundsphere_tracks_v1';
const PLAYLISTS_KEY = 'soundsphere_playlists_v1';
const AUTH_TOKEN_KEY = 'soundsphere_jwt_token';

// Helper to get stored auth token
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
};

// Helper to save auth token
export const saveAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

// Helper for authorized fetch headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper to get stored tracks or initialize defaults
const getStoredTracks = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // Fallback if parsing fails
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTracks));
  return sampleTracks;
};

// Helper to save tracks
const saveStoredTracks = (tracks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
};

// Helper to get stored playlists
const getStoredPlaylists = () => {
  const data = localStorage.getItem(PLAYLISTS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(samplePlaylists));
  return samplePlaylists;
};

// Helper to save playlists
const saveStoredPlaylists = (playlists) => {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
};

/**
 * Fetch all available tracks (API with localStorage fallback)
 * @returns {Promise<Array>}
 */
export async function getTracks() {
  try {
    const res = await fetch(`${API_BASE}/tracks`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        saveStoredTracks(data.data);
        return data.data;
      }
    }
  } catch {
    // Backend offline: silently fallback to browser storage
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredTracks());
    }, 200);
  });
}

/**
 * Get single track by ID
 * @param {number|string} id 
 * @returns {Promise<Object>}
 */
export async function getTrackById(id) {
  try {
    const res = await fetch(`${API_BASE}/tracks/${id}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch {
    // Fallback to local
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const numericId = Number(id);
      const track = tracks.find((t) => t.id === numericId);
      if (track) {
        resolve(track);
      } else {
        reject(new Error(`Track with ID "${id}" was not found.`));
      }
    }, 150);
  });
}

/**
 * Search tracks by query string (matching title, artist, album, genre)
 * @param {string} query 
 * @returns {Promise<Array>}
 */
export async function searchTracks(query = '') {
  const q = query.trim();
  if (q) {
    try {
      const res = await fetch(`${API_BASE}/tracks?q=${encodeURIComponent(q)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
      }
    } catch {
      // Fallback
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      if (!q) {
        resolve(tracks);
        return;
      }
      const lower = q.toLowerCase();
      const filtered = tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.artist.toLowerCase().includes(lower) ||
          (t.album && t.album.toLowerCase().includes(lower)) ||
          t.genre.toLowerCase().includes(lower)
      );
      resolve(filtered);
    }, 150);
  });
}

/**
 * Filter tracks by Genre
 * @param {string} genre 
 * @returns {Promise<Array>}
 */
export async function getTracksByGenre(genre = 'All') {
  if (genre && genre !== 'All') {
    try {
      const res = await fetch(`${API_BASE}/tracks?genre=${encodeURIComponent(genre)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
      }
    } catch {
      // Fallback
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      if (!genre || genre === 'All') {
        resolve(tracks);
        return;
      }
      const filtered = tracks.filter(
        (t) => t.genre.toLowerCase() === genre.toLowerCase()
      );
      resolve(filtered);
    }, 150);
  });
}

/**
 * Toggle track liked state
 * @param {number|string} id 
 * @returns {Promise<Object>}
 */
export async function toggleLike(id) {
  try {
    const res = await fetch(`${API_BASE}/tracks/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        // Sync local storage
        const tracks = getStoredTracks();
        const numericId = Number(id);
        const index = tracks.findIndex((t) => t.id === numericId);
        if (index !== -1) {
          tracks[index].liked = data.liked;
          saveStoredTracks(tracks);
          return tracks[index];
        }
      }
    }
  } catch {
    // Fallback
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const numericId = Number(id);
      const index = tracks.findIndex((t) => t.id === numericId);
      if (index !== -1) {
        tracks[index].liked = !tracks[index].liked;
        saveStoredTracks(tracks);
        resolve(tracks[index]);
      } else {
        reject(new Error(`Track with ID "${id}" not found to toggle like.`));
      }
    }, 150);
  });
}

/**
 * Record a play event (increments play count)
 * @param {number|string} id 
 */
export async function recordPlay(id) {
  try {
    await fetch(`${API_BASE}/tracks/${id}/play`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch {
    // Fire and forget
  }
}

/**
 * Get Featured Tracks (top play counts)
 * @returns {Promise<Array>}
 */
export async function getFeaturedTracks() {
  try {
    const res = await fetch(`${API_BASE}/tracks?sortBy=plays&order=desc&limit=6`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch {
    // Fallback
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const featured = [...tracks].sort((a, b) => b.plays - a.plays).slice(0, 6);
      resolve(featured);
    }, 200);
  });
}

/**
 * Get Trending Tracks
 * @returns {Promise<Array>}
 */
export async function getTrendingTracks() {
  try {
    const res = await fetch(`${API_BASE}/tracks/trending?limit=5`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch {
    // Fallback
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const trending = [...tracks].slice(0, 5);
      resolve(trending);
    }, 150);
  });
}

/**
 * Get Recently Added Tracks
 * @returns {Promise<Array>}
 */
export async function getRecentlyAdded() {
  try {
    const res = await fetch(`${API_BASE}/tracks?sortBy=release_year&order=desc&limit=6`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch {
    // Fallback
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const recent = [...tracks].sort((a, b) => (b.release_year || b.releaseYear) - (a.release_year || a.releaseYear)).slice(0, 6);
      resolve(recent);
    }, 150);
  });
}

/**
 * Get User Playlists
 * @returns {Promise<Array>}
 */
export async function getUserPlaylists() {
  try {
    const res = await fetch(`${API_BASE}/playlists`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        saveStoredPlaylists(data.data);
        return data.data;
      }
    }
  } catch {
    // Fallback
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const playlists = getStoredPlaylists();
      resolve(playlists);
    }, 150);
  });
}

/**
 * Add track to user playlist
 * @param {string} playlistId 
 * @param {number} trackId 
 * @returns {Promise<Array>}
 */
export async function addTrackToPlaylist(playlistId, trackId) {
  try {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ track_id: Number(trackId) })
    });
    if (res.ok) {
      // Re-fetch updated playlists
      return getUserPlaylists();
    }
  } catch {
    // Fallback
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const playlists = getStoredPlaylists();
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist) {
        if (!playlist.trackIds.includes(trackId)) {
          playlist.trackIds.push(trackId);
          playlist.trackCount = playlist.trackIds.length;
          saveStoredPlaylists(playlists);
        }
        resolve(playlists);
      } else {
        reject(new Error('Playlist not found.'));
      }
    }, 150);
  });
}

/**
 * Create a new user playlist
 * @param {string} title 
 * @param {string} description 
 * @returns {Promise<Array>}
 */
export async function createPlaylist(title, description = '') {
  try {
    const res = await fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, is_public: true })
    });
    if (res.ok) {
      return getUserPlaylists();
    }
  } catch {
    // Fallback
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const playlists = getStoredPlaylists();
      const newPlaylist = {
        id: `pl-${Date.now()}`,
        title,
        description: description || 'User created playlist',
        trackCount: 0,
        artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackIds: []
      };
      playlists.push(newPlaylist);
      saveStoredPlaylists(playlists);
      resolve(playlists);
    }, 150);
  });
}

/**
 * Fetch Listening Analytics for User Dashboard
 * @returns {Promise<Object>}
 */
export async function getDashboardAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }
  return null;
}
