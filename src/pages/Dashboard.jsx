import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Music,
  Clock,
  Heart,
  ListMusic,
  Play,
  Shuffle,
  Plus,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';
import * as musicService from '../services/musicService.js';
import MusicCard from '../components/MusicCard.jsx';
import TrackList from '../components/TrackList.jsx';
import PlaylistCard from '../components/PlaylistCard.jsx';
import Loading from '../components/Loading.jsx';

export default function Dashboard({ onOpenPlaylistModal }) {
  const navigate = useNavigate();
  const {
    recentlyPlayed,
    likedTrackIds,
    userPlaylists,
    playTrack,
    createNewPlaylist,
    showToast
  } = usePlayer();

  const [allTracks, setAllTracks] = useState([]);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    musicService.getTracks().then((tracks) => {
      setAllTracks(tracks);
      const favorites = tracks.filter((t) => likedTrackIds.includes(t.id));
      setFavoriteTracks(favorites);

      const recs = tracks.slice(2, 6);
      setRecommendedTracks(recs);
      setLoading(false);
    }).catch(console.error);
  }, [likedTrackIds]);

  const handleShuffleFavorites = () => {
    if (favoriteTracks.length === 0) {
      showToast('No favorite songs yet! Like some tracks to shuffle.');
      return;
    }
    const shuffled = [...favoriteTracks].sort(() => 0.5 - Math.random());
    playTrack(shuffled[0], shuffled);
    showToast('Shuffling Liked Songs 🔀');
  };

  const handleCreateNewPlaylist = () => {
    const title = prompt('Enter a title for your new playlist:');
    if (title && title.trim()) {
      createNewPlaylist(title.trim());
    }
  };

  const handlePlayPlaylist = (playlist) => {
    const playlistTracks = allTracks.filter((t) => playlist.trackIds?.includes(t.id));
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
      showToast(`Playing playlist "${playlist.title}" 🎶`);
    } else {
      showToast(`Playlist "${playlist.title}" is currently empty.`);
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <Loading message="Loading your dashboard statistics..." />
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="container">
        {/* User Profile Banner */}
        <div className="dashboard-user-banner">
          <div className="user-profile-left">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
              alt="Alex Morgan profile avatar"
              className="user-large-avatar"
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Welcome back, Alex!</h1>
                <span
                  style={{
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: '#ffffff',
                    color: '#000000',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  PRO MEMBER
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Your personal SoundSphere command center. Ready for your next session?
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleCreateNewPlaylist}>
              <Plus size={16} /> Create Playlist
            </button>
            <button className="btn btn-secondary" onClick={handleShuffleFavorites}>
              <Shuffle size={16} /> Shuffle Favorites
            </button>
          </div>
        </div>

        {/* Listening Statistics Cards */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1.2rem', fontSize: '1.4rem' }}>
            Listening Overview
          </h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Music size={24} color="#ffffff" />
              </div>
              <div>
                <div className="stat-value">1,420</div>
                <div className="stat-label">Songs Played</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Clock size={24} color="#ffffff" />
              </div>
              <div>
                <div className="stat-value">84.5 hrs</div>
                <div className="stat-label">Hours Listened</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Sparkles size={24} color="#ffffff" />
              </div>
              <div>
                <div className="stat-value">Electronic</div>
                <div className="stat-label">Favorite Genre</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <ListMusic size={24} color="#ffffff" />
              </div>
              <div>
                <div className="stat-value">{userPlaylists.length || 4}</div>
                <div className="stat-label">Playlists</div>
              </div>
            </div>
          </div>
        </section>

        {/* Recently Played */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={22} color="#ffffff" /> Recently Played
              </h2>
              <p className="section-subtitle">Tracks you listened to recently</p>
            </div>
          </div>

          <div className="grid-responsive">
            {recentlyPlayed.map((track) => (
              <MusicCard key={track.id} track={track} onOpenPlaylistModal={onOpenPlaylistModal} />
            ))}
          </div>
        </section>

        {/* Favorite Songs */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Heart size={22} color="#ffffff" fill="#ffffff" /> Favorite Songs ({favoriteTracks.length})
              </h2>
              <p className="section-subtitle">Songs you liked across SoundSphere</p>
            </div>
            {favoriteTracks.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => playTrack(favoriteTracks[0], favoriteTracks)}
              >
                <Play size={16} fill="#ffffff" /> Play All
              </button>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.2rem' }}>
            <TrackList tracks={favoriteTracks} onOpenPlaylistModal={onOpenPlaylistModal} />
          </div>
        </section>

        {/* User & Popular Playlists */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Your Playlists</h2>
              <p className="section-subtitle">Curated collections for every mood</p>
            </div>
            <button className="btn btn-secondary" onClick={handleCreateNewPlaylist}>
              <Plus size={16} /> New Playlist
            </button>
          </div>

          <div className="grid-responsive">
            {userPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} onPlayPlaylist={handlePlayPlaylist} />
            ))}
          </div>
        </section>

        {/* Recommended Songs */}
        <section style={{ marginBottom: '2rem' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={22} color="#ffffff" /> Recommended For You
              </h2>
              <p className="section-subtitle">Based on your listening history and liked genres</p>
            </div>
          </div>

          <div className="grid-responsive">
            {recommendedTracks.map((track) => (
              <MusicCard key={track.id} track={track} onOpenPlaylistModal={onOpenPlaylistModal} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
