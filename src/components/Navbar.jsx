import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Headphones, Home, Compass, LayoutDashboard, Menu, X, Activity } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isBackendConnected, currentUser } = usePlayer();

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="navbar" role="banner">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu} aria-label="SoundSphere Home">
          <div className="brand-icon-wrapper">
            <Headphones size={22} color="#ffffff" />
          </div>
          <span className="gradient-text">SoundSphere</span>
        </Link>

        {/* Navigation Links */}
        <nav role="navigation">
          <ul className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <Home size={18} />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/discover"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <Compass size={18} />
                <span>Discover</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* User Profile & Mobile Actions */}
        <div className="navbar-actions">
          {/* Live Backend Connection Indicator */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '20px',
              background: isBackendConnected ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.08)',
              color: isBackendConnected ? '#4ade80' : '#a1a1aa',
              border: `1px solid ${isBackendConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`
            }}
            title={isBackendConnected ? 'Connected to Node.js/Express REST API on port 5001' : 'Running in Offline / Local storage mode'}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isBackendConnected ? '#4ade80' : '#a1a1aa',
                boxShadow: isBackendConnected ? '0 0 6px #4ade80' : 'none'
              }}
            />
            {isBackendConnected ? 'API Live' : 'Offline'}
          </span>

          <Link to="/dashboard" className="nav-profile-btn" aria-label="User Profile">
            <img
              src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt="User profile avatar"
              className="user-avatar"
            />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{currentUser?.username || 'Alex'}</span>
          </Link>

          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
}
