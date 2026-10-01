import React from 'react';

export default function GenreChip({ label, isActive, onClick }) {
  return (
    <button
      className={`genre-chip ${isActive ? 'active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Filter by ${label} genre`}
    >
      {label}
    </button>
  );
}
