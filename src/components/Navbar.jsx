import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Headphones, Home, Compass, LayoutDashboard, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Link to="/dashboard" className="nav-profile-btn" aria-label="User Profile">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="User profile avatar"
              className="user-avatar"
            />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Alex</span>
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
