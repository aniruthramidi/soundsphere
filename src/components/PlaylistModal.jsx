import React, { useState } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function PlaylistModal({ track, onClose }) {
  const { userPlaylists, addToPlaylist, createNewPlaylist } = usePlayer();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!track) return null;

  const handleSelectPlaylist = (playlistId) => {
    addToPlaylist(playlistId, track);
    onClose();
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createNewPlaylist(newTitle);
    setNewTitle('');
    setIsCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 id="modal-title" style={{ fontSize: '1.25rem' }}>Add to Playlist</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)' }}>
          <img src={track.artwork} alt={track.title} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
          <div style={{ minWidth: 0 }}>
            <h4 style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{track.artist}</p>
          </div>
        </div>

        {!isCreating ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '220px', overflowY: 'auto' }}>
              {userPlaylists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleSelectPlaylist(pl.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Music size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{pl.title}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pl.trackCount || pl.trackIds?.length || 0} songs</span>
                </button>
              ))}
            </div>

            <button className="btn btn-secondary" onClick={() => setIsCreating(true)} style={{ width: '100%', marginTop: '0.5rem' }}>
              <Plus size={16} /> Create New Playlist
            </button>
          </>
        ) : (
          <form onSubmit={handleCreateNew} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '1rem' }}
              placeholder="Playlist title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create & Add
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
