import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Sparkles, Filter, Grid, List as ListIcon, History } from 'lucide-react';
import * as musicService from '../services/musicService.js';
import SearchBar from '../components/SearchBar.jsx';
import GenreChip from '../components/GenreChip.jsx';
import MusicCard from '../components/MusicCard.jsx';
import TrackList from '../components/TrackList.jsx';
import Loading from '../components/Loading.jsx';

export default function Discover({ onOpenPlaylistModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGenre = searchParams.get('genre') || 'All';
  const initialQuery = searchParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState(['Synthwave', 'Aetheria', 'Pop', 'Acoustic']);

  const genresList = ['All', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Classical', 'Indie', 'Jazz'];

  useEffect(() => {
    fetchFilteredTracks();
  }, [searchQuery, selectedGenre]);

  const fetchFilteredTracks = async () => {
    setLoading(true);
    try {
      let results = await musicService.getTracks();

      // Filter by genre
      if (selectedGenre && selectedGenre !== 'All') {
        results = results.filter(
          (t) => t.genre.toLowerCase() === selectedGenre.toLowerCase()
        );
      }

      // Filter by query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        results = results.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q) ||
            t.album.toLowerCase().includes(q) ||
            t.genre.toLowerCase().includes(q)
        );
      }

      setTracks(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setSearchParams((prev) => {
      if (val) prev.set('query', val);
      else prev.delete('query');
      return prev;
    });
  };

  const handleClearSearch = () => {
    handleSearchChange('');
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setSearchParams((prev) => {
      if (genre !== 'All') prev.set('genre', genre);
      else prev.delete('genre');
      return prev;
    });
  };

  const handleRecentTagClick = (tag) => {
    handleSearchChange(tag);
  };

  return (
    <main className="main-content">
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Compass size={22} />
            <span>SoundSphere Discover</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>
            Explore & Discover <span className="gradient-text">New Music</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px' }}>
            Search across artists, titles, genres, and albums. Use instant filters to refine your rhythm.
          </p>
        </div>

        {/* Search Bar Container */}
        <div style={{ marginBottom: '1.8rem' }}>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            placeholder="Search by song name, artist, album, or genre..."
          />
        </div>

        {/* Genre Filter Chips & Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="genre-chips-container" style={{ flex: 1 }}>
            {genresList.map((g) => (
              <GenreChip
                key={g}
                label={g}
                isActive={selectedGenre === g}
                onClick={() => handleGenreSelect(g)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ background: viewMode === 'grid' ? '#ffffff' : '#181818', color: viewMode === 'grid' ? '#000000' : '#ffffff' }}
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
              style={{ background: viewMode === 'list' ? '#ffffff' : '#181818', color: viewMode === 'list' ? '#000000' : '#ffffff' }}
              onClick={() => setViewMode('list')}
              aria-label="List View"
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        {/* Recently Searched Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={14} /> Recent searches:
          </span>
          {recentSearches.map((tag) => (
            <button
              key={tag}
              onClick={() => handleRecentTagClick(tag)}
              style={{
                fontSize: '0.8rem',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: '#181818',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-muted)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search & Filter Results */}
        <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.3rem' }}>
            {searchQuery || selectedGenre !== 'All' ? 'Search Results' : 'All Discover Tracks'}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.6rem', fontWeight: 400 }}>
              ({tracks.length} {tracks.length === 1 ? 'song' : 'songs'})
            </span>
          </h2>
        </div>

        {loading ? (
          <Loading message="Filtering music library..." />
        ) : tracks.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <Sparkles size={48} color="#ffffff" />
            <h3 style={{ fontSize: '1.4rem' }}>No songs found matching your search</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
              Try searching with another keyword or select a different genre filter.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                handleClearSearch();
                handleGenreSelect('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid-responsive">
            {tracks.map((track) => (
              <MusicCard key={track.id} track={track} onOpenPlaylistModal={onOpenPlaylistModal} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '1.2rem' }}>
            <TrackList tracks={tracks} onOpenPlaylistModal={onOpenPlaylistModal} />
          </div>
        )}
      </div>
    </main>
  );
}
