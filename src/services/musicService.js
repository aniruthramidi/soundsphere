import { sampleTracks, samplePlaylists } from '../data/tracks.js';

// Local storage key for persistent mock state
const STORAGE_KEY = 'soundsphere_tracks_v1';
const PLAYLISTS_KEY = 'soundsphere_playlists_v1';

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
 * Fetch all available tracks
 * @returns {Promise<Array>}
 */
export async function getTracks() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const tracks = getStoredTracks();
        resolve(tracks);
      } catch (err) {
        reject(new Error('Failed to load tracks from music service: ' + err.message));
      }
    }, 300);
  });
}

/**
 * Get single track by ID
 * @param {number|string} id 
 * @returns {Promise<Object>}
 */
export async function getTrackById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const tracks = getStoredTracks();
        const numericId = Number(id);
        const track = tracks.find((t) => t.id === numericId);
        if (track) {
          resolve(track);
        } else {
          reject(new Error(`Track with ID "${id}" was not found.`));
        }
      } catch (err) {
        reject(new Error('Error retrieving track details: ' + err.message));
      }
    }, 250);
  });
}

/**
 * Search tracks by query string (matching title, artist, album, genre)
 * @param {string} query 
 * @returns {Promise<Array>}
 */
export async function searchTracks(query = '') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const q = query.trim().toLowerCase();
      if (!q) {
        resolve(tracks);
        return;
      }
      const filtered = tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q)
      );
      resolve(filtered);
    }, 250);
  });
}

/**
 * Filter tracks by Genre
 * @param {string} genre 
 * @returns {Promise<Array>}
 */
export async function getTracksByGenre(genre = 'All') {
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
    }, 250);
  });
}

/**
 * Toggle track liked state
 * @param {number|string} id 
 * @returns {Promise<Object>}
 */
export async function toggleLike(id) {
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
    }, 200);
  });
}

/**
 * Get Featured Tracks (e.g. top play counts)
 * @returns {Promise<Array>}
 */
export async function getFeaturedTracks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const featured = [...tracks].sort((a, b) => b.plays - a.plays).slice(0, 6);
      resolve(featured);
    }, 300);
  });
}

/**
 * Get Trending Tracks
 * @returns {Promise<Array>}
 */
export async function getTrendingTracks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const trending = [...tracks].slice(0, 5);
      resolve(trending);
    }, 250);
  });
}

/**
 * Get Recently Added Tracks
 * @returns {Promise<Array>}
 */
export async function getRecentlyAdded() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks();
      const recent = [...tracks].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 6);
      resolve(recent);
    }, 250);
  });
}

/**
 * Get User Playlists
 * @returns {Promise<Array>}
 */
export async function getUserPlaylists() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const playlists = getStoredPlaylists();
      resolve(playlists);
    }, 200);
  });
}

/**
 * Add track to user playlist
 * @param {string} playlistId 
 * @param {number} trackId 
 * @returns {Promise<Array>}
 */
export async function addTrackToPlaylist(playlistId, trackId) {
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
    }, 200);
  });
}

/**
 * Create a new user playlist
 * @param {string} title 
 * @param {string} description 
 * @returns {Promise<Array>}
 */
export async function createPlaylist(title, description = '') {
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
    }, 200);
  });
}
