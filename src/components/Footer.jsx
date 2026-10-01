import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Heart, Globe, Radio, Disc, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'rgba(12, 12, 20, 0.95)',
        borderTop: '1px solid var(--surface-border)',
        padding: '3.5rem 0 2rem',
        marginTop: 'auto',
      }}
      role="contentinfo"
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="brand-icon-wrapper">
                <Headphones size={20} color="#ffffff" />
              </div>
              <span className="gradient-text" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                SoundSphere
              </span>
            </Link>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Next-generation music streaming experience built with React and Vite for front-end excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text)' }}>Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Home</Link></li>
              <li><Link to="/discover" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Discover</Link></li>
              <li><Link to="/dashboard" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dashboard</Link></li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text)' }}>Explore Genres</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link to="/discover?genre=Pop" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pop</Link></li>
              <li><Link to="/discover?genre=Electronic" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Electronic</Link></li>
              <li><Link to="/discover?genre=Hip Hop" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hip Hop</Link></li>
              <li><Link to="/discover?genre=Indie" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Indie & Rock</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text)' }}>Connect</h4>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn-icon" aria-label="Official Website"><Globe size={18} /></button>
              <button className="btn-icon" aria-label="SoundSphere Radio"><Radio size={18} /></button>
              <button className="btn-icon" aria-label="Discogs Store"><Disc size={18} /></button>
              <button className="btn-icon" aria-label="Features"><Sparkles size={18} /></button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--surface-border)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-subtle)',
          }}
        >
          <span>© {new Date().getFullYear()} SoundSphere. College Front-End Development Project.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            Crafted with <Heart size={14} fill="#ec4899" color="#ec4899" /> using React & Vite
          </span>
        </div>
      </div>
    </footer>
  );
}
