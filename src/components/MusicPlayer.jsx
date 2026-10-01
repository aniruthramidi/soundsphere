import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  ListMusic
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function MusicPlayer({ onOpenPlaylistModal }) {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    nextTrack,
    prevTrack,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    likedTrackIds,
    toggleLikeTrack,
    shareTrack
  } = usePlayer();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="music-player-bar" role="region" aria-label="Music Player Controls">
      <div className="player-grid">
        {/* Track Info */}
        <div className="player-track-info">
          <Link to={`/track/${currentTrack.id}`}>
            <img
              src={currentTrack.artwork}
              alt={`${currentTrack.title} cover`}
              className="player-artwork"
            />
          </Link>
          <div className="player-text-details">
            <Link to={`/track/${currentTrack.id}`} className="player-title" title={currentTrack.title}>
              {currentTrack.title}
            </Link>
            <span className="player-artist" title={currentTrack.artist}>
              {currentTrack.artist}
            </span>
          </div>

          {/* Quick Like & Share */}
          <button
            className="btn-icon"
            style={{ width: 34, height: 34, marginLeft: '0.4rem' }}
            onClick={() => toggleLikeTrack(currentTrack.id)}
            aria-label={isLiked ? 'Unlike song' : 'Like song'}
          >
            <Heart size={16} fill={isLiked ? '#ffffff' : 'none'} color={isLiked ? '#ffffff' : 'currentColor'} />
          </button>
        </div>

        {/* Center Controls & Progress Bar */}
        <div className="player-controls-center">
          <div className="player-buttons-row">
            <button
              className="btn-icon"
              style={{ width: 36, height: 36 }}
              onClick={prevTrack}
              aria-label="Previous Track"
            >
              <SkipBack size={18} />
            </button>

            <button
              className="play-toggle-btn"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause Track' : 'Play Track'}
            >
              {isPlaying ? <Pause size={20} fill="#000000" /> : <Play size={20} fill="#000000" style={{ marginLeft: 2 }} />}
            </button>

            <button
              className="btn-icon"
              style={{ width: 36, height: 36 }}
              onClick={nextTrack}
              aria-label="Next Track"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="player-progress-row">
            <span className="time-stamp">{formatTime(currentTime)}</span>
            
            <div className="progress-bar-container">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime || 0}
                onChange={handleSeekChange}
                aria-label="Track progress slider"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              />
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="time-stamp">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Actions: Volume & Playlist */}
        <div className="player-right-actions">
          {onOpenPlaylistModal && (
            <button
              className="btn-icon"
              onClick={() => onOpenPlaylistModal(currentTrack)}
              aria-label="Add to Playlist"
              title="Add to Playlist"
            >
              <ListMusic size={18} />
            </button>
          )}

          <button
            className="btn-icon"
            onClick={() => shareTrack(currentTrack)}
            aria-label="Share current song"
            title="Share track"
          >
            <Share2 size={18} />
          </button>

          <div className="volume-slider-wrapper">
            <button
              className="btn-icon"
              style={{ border: 'none', background: 'none', width: 32, height: 32 }}
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute Volume' : 'Mute Volume'}
            >
              {isMuted || volume === 0 ? <VolumeX size={18} color="var(--danger)" /> : <Volume2 size={18} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="volume-input"
              aria-label="Volume Slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
