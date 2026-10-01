import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search songs, artists, albums, or genres...' }) {
  return (
    <div className="search-bar-wrapper">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search music"
      />
      {value && (
        <button className="search-clear-btn" onClick={onClear} aria-label="Clear search input">
          <X size={18} />
        </button>
      )}
    </div>
  );
}
