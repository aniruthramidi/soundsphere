import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'Unable to load tracks.', onRetry }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '500px',
        margin: '2rem auto',
        textAlign: 'center',
      }}
      role="alert"
    >
      <AlertCircle size={42} color="var(--danger)" />
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--text)' }}>Oops! Something went wrong</h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>{message}</p>
      </div>

      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}
