import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  Share2,
  PlusCircle,
  Clock,
  Disc,
  Calendar,
  Headphones,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import * as musicService from '../services/musicService.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import MusicCard from '../components/MusicCard.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function TrackDetail({ onOpenPlaylistModal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayPause, likedTrackIds, toggleLikeTrack, shareTrack } =
    usePlayer();

  const [track, setTrack] = useState(null);
  const [relatedTracks, setRelatedTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrackData();
  }, [id]);

  const fetchTrackData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await musicService.getTrackById(id);
      setTrack(data);

      const all = await musicService.getTracks();
      const related = all.filter((t) => t.id !== data.id && t.genre === data.genre).slice(0, 4);
      setRelatedTracks(related);
    } catch (err) {
      setError(err.message || 'Unable to retrieve track details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <Loading message="Loading song details..." />
      </main>
    );
  }

  if (error || !track) {
    return (
      <main className="main-content">
        <ErrorMessage message={error || 'Song not found'} onRetry={fetchTrackData} />
      </main>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrentTrack && isPlaying;
  const isLiked = likedTrackIds.includes(track.id);

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const formatPlays = (num) => {
    return (num || 0).toLocaleString();
  };

  const handlePlayClick = () => {
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <main className="main-content">
      <div className="container">
        {/* Navigation back button */}
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          style={{ marginBottom: '2rem' }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Track Detail Hero Card */}
        <div className="track-detail-hero glass-panel" style={{ padding: '2.5rem' }}>
          <div>
            <img
              src={track.artwork}
              alt={`${track.title} album cover`}
              className="detail-artwork-large"
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <span
                style={{
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  background: '#ffffff',
                  color: '#000000',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                }}
              >
                {track.genre}
              </span>
              <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} /> {track.releaseYear || 2024}
              </span>
            </div>

            <h1 style={{ fontSize: '2.8rem', marginBottom: '0.4rem', lineHeight: 1.15 }}>
              {track.title}
            </h1>
            
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '1.5rem' }}>
              By <span style={{ color: 'var(--text)', fontWeight: 700 }}>{track.artist}</span>
            </h2>

            {/* Metadata Pills */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Disc size={16} color="#ffffff" /> Album: <strong style={{ color: 'var(--text)' }}>{track.album}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#ffffff" /> Duration: <strong style={{ color: 'var(--text)' }}>{formatDuration(track.duration)}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Headphones size={16} color="#ffffff" /> Total Plays: <strong style={{ color: 'var(--text)' }}>{formatPlays(track.plays)}</strong>
              </span>
            </div>

            {/* Action buttons */}
            <div className="detail-actions-row">
              <button
                className="btn btn-primary"
                onClick={handlePlayClick}
                style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}
              >
                {isCurrentPlaying ? <Pause size={22} fill="#000000" /> : <Play size={22} fill="#000000" style={{ marginLeft: 3 }} />}
                {isCurrentPlaying ? 'Pause Track' : 'Play Track'}
              </button>

              <button
                className={`btn-icon ${isLiked ? 'active' : ''}`}
                style={{ width: 48, height: 48, background: isLiked ? '#ffffff' : '#181818', color: isLiked ? '#000000' : '#ffffff' }}
                onClick={() => toggleLikeTrack(track.id)}
                aria-label={isLiked ? 'Unlike track' : 'Like track'}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart size={20} fill={isLiked ? '#000000' : 'none'} color={isLiked ? '#000000' : 'currentColor'} />
              </button>

              <button
                className="btn-icon"
                style={{ width: 48, height: 48 }}
                onClick={() => onOpenPlaylistModal && onOpenPlaylistModal(track)}
                aria-label="Add to Playlist"
                title="Add to Playlist"
              >
                <PlusCircle size={20} />
              </button>

              <button
                className="btn-icon"
                style={{ width: 48, height: 48 }}
                onClick={() => shareTrack(track)}
                aria-label="Share track"
                title="Share track"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Description / Story Section */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.8rem' }}>About this Track</h3>
          <div className="glass-panel" style={{ padding: '1.8rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem' }}>
              {track.description ||
                `" ${track.title} " is an exceptional ${track.genre} record by ${track.artist}, featured on the album "${track.album}". Produced with spatial audio precision, this song showcases masterful instrumentation and dynamic rhythmic progressions.`}
            </p>
          </div>
        </section>

        {/* Related Songs */}
        <section style={{ marginBottom: '2rem' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={22} color="#ffffff" /> Related Tracks in {track.genre}
              </h3>
              <p className="section-subtitle">More music you might enjoy based on this track</p>
            </div>
          </div>

          <div className="grid-responsive">
            {relatedTracks.map((relTrack) => (
              <MusicCard key={relTrack.id} track={relTrack} onOpenPlaylistModal={onOpenPlaylistModal} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
