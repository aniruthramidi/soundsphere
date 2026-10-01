import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Share2, PlusCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function MusicCard({ track, onOpenPlaylistModal }) {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayPause, likedTrackIds, toggleLikeTrack, shareTrack } =
    usePlayer();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrentTrack && isPlaying;
  const isLiked = likedTrackIds.includes(track.id);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleCardClick = () => {
    navigate(`/track/${track.id}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLikeTrack(track.id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    shareTrack(track);
  };

  const handleAddPlaylist = (e) => {
    e.stopPropagation();
    if (onOpenPlaylistModal) {
      onOpenPlaylistModal(track);
    }
  };

  return (
    <div
      className={`music-card ${isCurrentTrack ? 'is-playing' : ''}`}
      onClick={handleCardClick}
      role="article"
      aria-label={`${track.title} by ${track.artist}`}
    >
      <div className="card-artwork-wrapper">
        <img src={track.artwork} alt={`${track.title} album cover`} className="card-artwork" loading="lazy" />
        <span className="card-genre-badge">{track.genre}</span>
        
        <div className="card-play-overlay">
          <button
            className="card-play-btn"
            onClick={handlePlayClick}
            aria-label={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          >
            {isCurrentPlaying ? <Pause size={24} fill="#000000" /> : <Play size={24} fill="#000000" style={{ marginLeft: 3 }} />}
          </button>
        </div>
      </div>

      <div className="card-info">
        <h3 className="card-title" title={track.title}>{track.title}</h3>
        <p className="card-artist" title={track.artist}>{track.artist}</p>
      </div>

      <div className="card-footer-actions">
        <span className="card-duration">{formatDuration(track.duration)}</span>
        
        <div className="card-actions-row">
          <button
            className="btn-icon"
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike song' : 'Like song'}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={isLiked ? '#ffffff' : 'none'} color={isLiked ? '#ffffff' : 'currentColor'} />
          </button>

          <button
            className="btn-icon"
            onClick={handleAddPlaylist}
            aria-label="Add to playlist"
            title="Add to Playlist"
          >
            <PlusCircle size={16} />
          </button>

          <button
            className="btn-icon"
            onClick={handleShare}
            aria-label="Share track"
            title="Share track"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
