import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading music...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        gap: '1rem',
        color: 'var(--text-muted)',
      }}
      role="status"
      aria-live="polite"
    >
      <Loader2 size={38} className="spin-icon" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
