/**
 * SoundSphere Database Seed Script
 * Pre-populates the database with default users, tracks, playlists, favorites, and listening history.
 */

const bcrypt = require('bcryptjs');
const { initDatabase, getDb } = require('./database');

async function seed(customDb) {
  const db = customDb || getDb();
  console.log('🌱 Starting SoundSphere database seeding...');

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, username, email, password_hash, role, avatar_url, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    1,
    'alex_vance',
    'alex@soundsphere.io',
    passwordHash,
    'listener',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    'Passionate audiophile, electronic music curator, and daily SoundSphere listener.'
  );

  insertUser.run(
    2,
    'soundsphere_admin',
    'admin@soundsphere.io',
    adminPasswordHash,
    'admin',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    'SoundSphere Lead Platform Administrator & System Moderator.'
  );

  insertUser.run(
    3,
    'maya_thorne',
    'artist@soundsphere.io',
    passwordHash,
    'creator',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'Electronic music producer, sound designer, and verified SoundSphere Creator.'
  );

  // 2. Authentic 15 SoundSphere Tracks
  const sampleTracks = [
    {
      id: 1,
      title: "Midnight Cyberspace",
      artist: "Aetheria",
      album: "Neon Dreams",
      genre: "Electronic",
      duration: 214,
      artwork: "/artwork/midnight_cyberspace.jpg",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      description: "A pulsating synthwave track that blends analog synths with futuristic sub-bass, perfect for late night coding and chill drives.",
      release_year: 2024,
      plays: 1420500,
      created_by: 3
    },
    {
      id: 2,
      title: "Electric Horizons",
      artist: "Lunar Echoes",
      album: "Starlight Voyage",
      genre: "Electronic",
      duration: 185,
      artwork: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      description: "An uplifting ambient electronic piece featuring soaring melodies and crisp percussion rhythms.",
      release_year: 2023,
      plays: 982100,
      created_by: 3
    },
    {
      id: 3,
      title: "Golden Hour Symphony",
      artist: "Solaria Groove",
      album: "Summer Mirage",
      genre: "Pop",
      duration: 228,
      artwork: "/artwork/golden_hour_symphony.jpg",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      description: "A catchy pop masterpiece with vibrant basslines, tropical synth hooks, and infectious vocal melodies.",
      release_year: 2024,
      plays: 2310400,
      created_by: 3
    },
    {
      id: 4,
      title: "Urban Skyline",
      artist: "Metro Pulse",
      album: "Concrete Jungle",
      genre: "Hip-Hop",
      duration: 195,
      artwork: "/artwork/urban_skyline.jpg",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      description: "Booming 808s paired with gritty vinyl samples capturing the relentless energy of nighttime downtown.",
      release_year: 2024,
      plays: 1750200,
      created_by: 1
    },
    {
      id: 5,
      title: "Clash of Titans",
      artist: "Iron Resonance",
      album: "Heavy Voltage",
      genre: "Rock",
      duration: 242,
      artwork: "/artwork/clash_of_titans.jpg",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      description: "Roaring electric guitar riffs and pounding drums that unleash raw adrenaline and stage presence.",
      release_year: 2023,
      plays: 890300,
      created_by: 1
    },
    {
      id: 6,
      title: "Velvet Rain",
      artist: "The Blue Notes",
      album: "Midnight Café",
      genre: "Jazz",
      duration: 265,
      artwork: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      description: "Intimate saxophone solos accompanied by mellow upright bass and brush drums in a smoky jazz lounge setting.",
      release_year: 2022,
      plays: 640100,
      created_by: 1
    },
    {
      id: 7,
      title: "Moonlit Sonata Modern",
      artist: "Clara Vance",
      album: "Reflections in Ivory",
      genre: "Classical",
      duration: 310,
      artwork: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      description: "A breathtaking contemporary neo-classical piano composition that touches the deepest emotional chords.",
      release_year: 2024,
      plays: 430900,
      created_by: 1
    },
    {
      id: 8,
      title: "Solar Eclipse",
      artist: "Astral Waves",
      album: "Cosmic Odyssey",
      genre: "Ambient",
      duration: 280,
      artwork: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      description: "A hypnotic journey through sonic soundscapes, deep reverberations, and meditative modular pads.",
      release_year: 2023,
      plays: 520800,
      created_by: 3
    },
    {
      id: 9,
      title: "Cybernetic Heartbeat",
      artist: "Synth Collective",
      album: "Retrofuturism 2099",
      genre: "Electronic",
      duration: 205,
      artwork: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      description: "Driving arpeggiators and crisp hi-hats that recreate classic 80s arcade action with modern fidelity.",
      release_year: 2024,
      plays: 1120000,
      created_by: 3
    },
    {
      id: 10,
      title: "Sunset Boulevard",
      artist: "The Coastlines",
      album: "Pacific Memories",
      genre: "Pop",
      duration: 198,
      artwork: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
      description: "Carefree indie-pop anthem featuring acoustic guitar strums, sunny vocal harmonies, and warm bass.",
      release_year: 2024,
      plays: 1890000,
      created_by: 1
    },
    {
      id: 11,
      title: "Drop the Bassline",
      artist: "DJ SubZero",
      album: "Frequency Shift",
      genre: "Electronic",
      duration: 172,
      artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
      description: "High-octane club banger packed with heavy festival drops, pitch-shifted vocal chops, and laser synths.",
      release_year: 2024,
      plays: 2840000,
      created_by: 3
    },
    {
      id: 12,
      title: "Rainy Day Lo-Fi",
      artist: "Coffee & Keys",
      album: "Study Sessions Vol. 4",
      genre: "Lo-Fi",
      duration: 165,
      artwork: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
      description: "Gentle cassette tape hiss, detuned electric piano chords, and sleepy hip-hop beats for deep focus.",
      release_year: 2023,
      plays: 3105000,
      created_by: 1
    },
    {
      id: 13,
      title: "Acoustic Whispers",
      artist: "Sierra Wood",
      album: "Timberline",
      genre: "Acoustic",
      duration: 215,
      artwork: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
      description: "An intimate solo fingerstyle acoustic performance recorded in a resonant wooden mountain cabin.",
      release_year: 2023,
      plays: 720000,
      created_by: 1
    },
    {
      id: 14,
      title: "Echoes of Eternity",
      artist: "Philharmonic 101",
      album: "Majestic Horizons",
      genre: "Classical",
      duration: 335,
      artwork: "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
      description: "A sweeping orchestral arrangement with triumphant brass, delicate violins, and dramatic timpani.",
      release_year: 2022,
      plays: 512000,
      created_by: 1
    },
    {
      id: 15,
      title: "Harbor Lights",
      artist: "Smooth Sax Quartet",
      album: "Cozy Afternoons",
      genre: "Jazz",
      duration: 250,
      artwork: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600&auto=format&fit=crop&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
      description: "Warm and romantic jazz quartet performance designed for relaxing evenings.",
      release_year: 2024,
      plays: 945000,
      created_by: 1
    }
  ];

  const insertTrack = db.prepare(`
    INSERT OR REPLACE INTO tracks (id, title, artist, album, genre, duration, artwork, audio, description, release_year, plays, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of sampleTracks) {
    insertTrack.run(
      t.id,
      t.title,
      t.artist,
      t.album,
      t.genre,
      t.duration,
      t.artwork,
      t.audio,
      t.description,
      t.release_year,
      t.plays,
      t.created_by
    );
  }

  // 3. Curated Playlists
  const samplePlaylists = [
    {
      id: "pl-1",
      user_id: 1,
      title: "Chill Midnight Vibes",
      description: "Late night atmospheric synths and mellow beats",
      artwork: "/artwork/midnight_cyberspace.jpg",
      is_public: 1,
      trackIds: [1, 2, 5, 8, 9, 15]
    },
    {
      id: "pl-2",
      user_id: 1,
      title: "High-Energy Workout",
      description: "Pump up your day with intense electronic and rock tracks",
      artwork: "/artwork/clash_of_titans.jpg",
      is_public: 1,
      trackIds: [3, 6, 10, 11, 13]
    },
    {
      id: "pl-3",
      user_id: 1,
      title: "Focus & Flow State",
      description: "Instrumental, classical, and ambient sounds for total concentration",
      artwork: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&auto=format&fit=crop&q=80",
      is_public: 1,
      trackIds: [7, 8, 12, 14]
    },
    {
      id: "pl-4",
      user_id: 1,
      title: "Top Chart Hits",
      description: "The most listened and trending tracks on SoundSphere",
      artwork: "/artwork/golden_hour_symphony.jpg",
      is_public: 1,
      trackIds: [1, 3, 4, 10, 11]
    }
  ];

  const insertPlaylist = db.prepare(`
    INSERT OR REPLACE INTO playlists (id, user_id, title, description, artwork, is_public)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertPlaylistTrack = db.prepare(`
    INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, position)
    VALUES (?, ?, ?)
  `);

  for (const p of samplePlaylists) {
    insertPlaylist.run(p.id, p.user_id, p.title, p.description, p.artwork, p.is_public);
    p.trackIds.forEach((tId, idx) => {
      insertPlaylistTrack.run(p.id, tId, idx + 1);
    });
  }

  // 4. Initial Favorites for User 1 (Alex)
  const insertFavorite = db.prepare(`
    INSERT OR IGNORE INTO favorites (user_id, track_id)
    VALUES (?, ?)
  `);

  const initialFavorites = [1, 3, 8, 11, 15];
  for (const trackId of initialFavorites) {
    insertFavorite.run(1, trackId);
  }

  // 5. Initial Play History for User 1 (Alex)
  const insertPlayHistory = db.prepare(`
    INSERT INTO play_history (user_id, track_id, played_at)
    VALUES (?, ?, datetime('now', ?))
  `);

  const initialHistory = [
    { trackId: 1, timeOffset: '-10 minutes' },
    { trackId: 3, timeOffset: '-35 minutes' },
    { trackId: 11, timeOffset: '-2 hours' },
    { trackId: 8, timeOffset: '-5 hours' },
    { trackId: 12, timeOffset: '-1 day' },
    { trackId: 4, timeOffset: '-2 days' },
    { trackId: 2, timeOffset: '-3 days' }
  ];

  for (const h of initialHistory) {
    insertPlayHistory.run(1, h.trackId, h.timeOffset);
  }

  console.log('✅ SoundSphere database seeded successfully!');
}

if (require.main === module) {
  initDatabase();
  seed()
    .then(() => {
      console.log('Seed process completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
