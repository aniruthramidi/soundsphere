import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Sparkles, TrendingUp, Radio, Flame, ArrowRight, Music2 } from 'lucide-react';
import * as musicService from '../services/musicService.js';
import MusicCard from '../components/MusicCard.jsx';
import TrackList from '../components/TrackList.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function HomePage({ onOpenPlaylistModal }) {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [featured, trending, recent] = await Promise.all([
        musicService.getFeaturedTracks(),
        musicService.getTrendingTracks(),
        musicService.getRecentlyAdded(),
      ]);
      setFeaturedTracks(featured);
      setTrendingTracks(trending);
      setRecentlyAdded(recent);
    } catch (err) {
      setError(err.message || 'Failed to load home page content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const genres = [
    { name: 'Pop', color: 'linear-gradient(135deg, #27272a, #18181b)', count: '450+ Tracks' },
    { name: 'Electronic', color: 'linear-gradient(135deg, #3f3f46, #27272a)', count: '380+ Tracks' },
    { name: 'Hip Hop', color: 'linear-gradient(135deg, #52525b, #3f3f46)', count: '520+ Tracks' },
    { name: 'Rock', color: 'linear-gradient(135deg, #27272a, #09090b)', count: '310+ Tracks' },
    { name: 'Indie', color: 'linear-gradient(135deg, #3f3f46, #18181b)', count: '290+ Tracks' },
    { name: 'Jazz', color: 'linear-gradient(135deg, #52525b, #27272a)', count: '210+ Tracks' },
    { name: 'Classical', color: 'linear-gradient(135deg, #27272a, #141414)', count: '180+ Tracks' },
  ];

  const popularArtists = [
    { name: 'Aetheria', genre: 'Electronic', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { name: 'Solaria Groove', genre: 'Pop', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { name: 'Vibe Syndicate', genre: 'Hip Hop', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
    { name: 'Maya Lin', genre: 'Indie Folk', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80' },
    { name: 'Neon Voltage', genre: 'Cyber Rock', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
  ];

  if (loading) {
    return (
      <main className="main-content">
        <Loading message="Tuning SoundSphere for you..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <ErrorMessage message={error} onRetry={fetchHomeData} />
      </main>
    );
  }

  return (
    <main className="main-content">
      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-backdrop-glow" />
        <div className="hero-grid">
          <div>
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Next-Gen Audio Experience</span>
            </div>
            <h1 className="hero-title">
              Immerse Yourself in <span className="gradient-text">Pure Sound</span>
            </h1>
            <p className="hero-subtitle">
              Discover millions of ultra-HD tracks, curated playlists, and trending global beats. SoundSphere brings music to life with spatial audio clarity and personalized discovery.
            </p>

            <div className="hero-cta-group">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (featuredTracks.length > 0) playTrack(featuredTracks[0], featuredTracks);
                }}
              >
                <Play size={18} fill="#000000" />
                Start Listening
              </button>

              <button className="btn btn-secondary" onClick={() => navigate('/discover')}>
                <Radio size={18} />
                Explore Discover
              </button>
            </div>
          </div>

          <div className="hero-visual-card">
            <img
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80"
              alt="Hero Music Atmosphere"
              className="hero-visual-img"
            />
          </div>
        </div>
      </section>

      {/* Featured Music */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Music</h2>
            <p className="section-subtitle">Handpicked tracks setting the global music vibe</p>
          </div>
          <Link to="/discover" className="nav-link" style={{ color: '#ffffff' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-responsive">
          {featuredTracks.map((track) => (
            <MusicCard key={track.id} track={track} onOpenPlaylistModal={onOpenPlaylistModal} />
          ))}
        </div>
      </section>

      {/* Trending Tracks */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <TrendingUp size={24} color="#ffffff" /> Trending Now
            </h2>
            <p className="section-subtitle">Top played tracks across SoundSphere listeners today</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <TrackList tracks={trendingTracks} onOpenPlaylistModal={onOpenPlaylistModal} />
        </div>
      </section>

      {/* Music Genres */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Explore Genres</h2>
            <p className="section-subtitle">Dive into your favorite style of rhythm</p>
          </div>
        </div>

        <div className="grid-genres">
          {genres.map((g) => (
            <div
              key={g.name}
              className="genre-banner-card"
              style={{ background: g.color }}
              onClick={() => navigate(`/discover?genre=${g.name}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/discover?genre=${g.name}`);
              }}
            >
              <span>{g.name}</span>
              <span style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 500 }}>{g.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Flame size={24} color="#ffffff" /> Popular Artists
            </h2>
            <p className="section-subtitle">Creators powering the SoundSphere community</p>
          </div>
        </div>

        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {popularArtists.map((artist) => (
            <div
              key={artist.name}
              className="glass-panel"
              style={{
                padding: '1.4rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.8rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onClick={() => navigate(`/discover?query=${artist.name}`)}
            >
              <img
                src={artist.img}
                alt={artist.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ffffff',
                  filter: 'grayscale(50%)',
                }}
              />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{artist.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{artist.genre}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Added */}
      <section className="container" style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Music2 size={24} color="#ffffff" /> Recently Added
            </h2>
            <p className="section-subtitle">Fresh releases fresh off the studio</p>
          </div>
        </div>

        <div className="grid-responsive">
          {recentlyAdded.map((track) => (
            <MusicCard key={track.id} track={track} onOpenPlaylistModal={onOpenPlaylistModal} />
          ))}
        </div>
      </section>
    </main>
  );
}
