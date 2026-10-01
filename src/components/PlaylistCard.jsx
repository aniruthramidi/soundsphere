import React from 'react';
import { Play, Music } from 'lucide-react';

export default function PlaylistCard({ playlist, onPlayPlaylist }) {
  return (
    <div className="playlist-card" role="article" aria-label={`Playlist ${playlist.title}`}>
      <div style={{ position: 'relative' }}>
        <img
          src={playlist.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
          alt={`${playlist.title} cover`}
          className="playlist-art"
          loading="lazy"
        />
        {onPlayPlaylist && (
          <button
            className="card-play-btn"
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '42px',
              height: '42px',
            }}
            onClick={() => onPlayPlaylist(playlist)}
            aria-label={`Play playlist ${playlist.title}`}
          >
            <Play size={20} fill="#ffffff" style={{ marginLeft: 2 }} />
          </button>
        )}
      </div>

      <div>
        <h3 className="playlist-title">{playlist.title}</h3>
        <p className="playlist-desc">{playlist.description}</p>
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--primary)',
            fontWeight: 600,
            marginTop: '0.4rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <Music size={12} />
          {playlist.trackCount || playlist.trackIds?.length || 0} Tracks
        </span>
      </div>
    </div>
  );
}
