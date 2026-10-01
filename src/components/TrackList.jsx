import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Share2, PlusCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function TrackList({ tracks, onOpenPlaylistModal }) {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayPause, likedTrackIds, toggleLikeTrack, shareTrack } =
    usePlayer();

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!tracks || tracks.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No tracks found in this list.
      </div>
    );
  }

  return (
    <div className="track-list" role="list">
      {tracks.map((track, idx) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentPlaying = isCurrentTrack && isPlaying;
        const isLiked = likedTrackIds.includes(track.id);

        const handleRowClick = () => {
          navigate(`/track/${track.id}`);
        };

        const handlePlayClick = (e) => {
          e.stopPropagation();
          if (isCurrentTrack) {
            togglePlayPause();
          } else {
            playTrack(track, tracks);
          }
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
            key={track.id}
            className={`track-item ${isCurrentTrack ? 'is-playing' : ''}`}
            onClick={handleRowClick}
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRowClick();
            }}
          >
            {/* Rank index / Play button */}
            <div className="track-index">
              <button
                className="btn-icon"
                style={{ width: 32, height: 32, border: 'none', background: 'transparent' }}
                onClick={handlePlayClick}
                aria-label={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
              >
                {isCurrentPlaying ? (
                  <Pause size={18} color="#ffffff" />
                ) : (
                  <Play size={18} color={isCurrentTrack ? '#ffffff' : 'var(--text-muted)'} />
                )}
              </button>
            </div>

            {/* Artwork */}
            <img src={track.artwork} alt={`${track.title} artwork`} className="track-thumb" loading="lazy" />

            {/* Title & Artist */}
            <div className="track-title-block">
              <span className="track-title-text">{track.title}</span>
              <span className="track-artist-text">{track.artist}</span>
            </div>

            {/* Album */}
            <div className="track-album-text">{track.album}</div>

            {/* Genre */}
            <div>
              <span className="track-genre-chip">{track.genre}</span>
            </div>

            {/* Actions & Duration */}
            <div className="track-duration-actions">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginRight: '0.5rem' }}>
                {formatDuration(track.duration)}
              </span>

              <button
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                onClick={handleLike}
                aria-label={isLiked ? 'Unlike song' : 'Like song'}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart size={15} fill={isLiked ? '#ffffff' : 'none'} color={isLiked ? '#ffffff' : 'currentColor'} />
              </button>

              <button
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                onClick={handleAddPlaylist}
                aria-label="Add to Playlist"
                title="Add to Playlist"
              >
                <PlusCircle size={15} />
              </button>

              <button
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                onClick={handleShare}
                aria-label="Share song"
                title="Share song"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
