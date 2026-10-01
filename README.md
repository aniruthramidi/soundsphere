# SoundSphere – Music Streaming Web Application

A professional, responsive, feature-rich music streaming web application built as a college front-end development project using **React**, **Vite**, **JavaScript (ES6+)**, **CSS3**, **React Router DOM**, and **Lucide React**.

---

## 1. Project Overview

**SoundSphere** is a modern, commercial-grade web application designed for seamless music discovery, playback, playlist management, and user interaction. Inspired by leading global streaming platforms, SoundSphere offers a sleek dark-themed interface, fluid micro-interactions, responsive design across all devices, accessible navigation, and a persistent HTML5 audio player.

---

## 2. Objective

The primary objective of this project is to demonstrate advanced front-end web development skills required for modern web application design. It satisfies all core criteria for a college assignment:
- Dynamic component-based React architecture
- Client-side routing without page reloads using React Router
- Asynchronous service layer simulating backend REST APIs
- Full audio playback state management using React Context API
- Accessible, mobile-responsive user interfaces adhering to WCAG standards

---

## 3. Key Features

- 🎵 **Persistent Global Audio Player**: Fixed bottom player with Play/Pause, Next, Previous, seek progress bar, real-time timestamps, volume slider, and mute toggle.
- 🔍 **Dynamic Discover & Search**: Instant filtering by song title, artist name, album, or genre without reloads.
- ❤️ **Favorite & Like System**: Toggle song likes with state and `localStorage` persistence.
- 📂 **Playlist Creation & Management**: Add any track to custom user playlists or create new playlists on the fly.
- 🔗 **Web Share Integration**: Share tracks using native Web Share API or clipboard copy fallback with toast alerts.
- 📊 **User Dashboard Analytics**: Statistics including *Songs Played*, *Hours Listened*, *Favorite Genre*, and *Playlists Created*.
- 🎨 **Modern Dark Theme UI**: Glassmorphic styling, HSL gradients, smooth hover effects, custom scrollbars, and focus rings.

---

## 4. Required Pages / Views

### Page 1 – Landing / Home Page (`/`)
- Hero section with gradient typography, soundwave badge, and CTA buttons ("Start Listening", "Explore Discover")
- Featured Music grid showcasing top curated tracks
- Trending Tracks section with live playback controls
- Interactive Music Genres grid
- Popular Artists cards showcase
- Recently Added music section
- Commercial footer with quick links and copyright

### Page 2 – User Dashboard (`/dashboard`)
- Personalized user profile banner ("Welcome back, Alex!")
- Pro Listener badge and quick access buttons ("Create Playlist", "Shuffle Favorites")
- 4 Listening Statistics Cards: *Songs Played*, *Hours Listened*, *Favorite Genre*, *Playlists*
- Recently Played tracks horizontal list
- Favorite Songs (Liked tracks) section with "Play All" trigger
- User & Custom Playlists grid
- Recommended Songs tailored to listening history

### Page 3 – Music Detail Page (`/track/:id`)
- Param-based dynamic route loading specific track metadata
- High-resolution album artwork with glowing aura
- Song title, artist, album, genre badge, release year, duration, and play counts
- Interactive action bar: Play/Pause, Like toggle, Share button, Add to Playlist modal
- Track narrative story / background description
- Related tracks grid matching genre

### Page 4 – Discover / Search Page (`/discover`)
- Search bar with clear button and real-time input handling
- Genre filter chips ("All", "Pop", "Rock", "Hip Hop", "Electronic", "Classical", "Indie", "Jazz")
- Recently searched keyword tags
- Toggle between Grid and List view modes
- URL search parameter synchronization (`?genre=Pop`, `?query=...`)
- Empty state with reset filters CTA

---

## 5. Technology Stack

- **Framework**: React.js 18
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+), HTML5, CSS3 (Vanilla CSS variables)
- **Routing**: React Router DOM (`react-router-dom` v7)
- **Icons**: Lucide React (`lucide-react`)
- **State Management**: React Context API (`PlayerContext`)
- **Persistence**: Browser `localStorage` API

---

## 6. Project Architecture

```text
SoundSphere/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── MusicCard.jsx
│   │   ├── TrackList.jsx
│   │   ├── MusicPlayer.jsx
│   │   ├── SearchBar.jsx
│   │   ├── GenreChip.jsx
│   │   ├── PlaylistCard.jsx
│   │   ├── Loading.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── Footer.jsx
│   │   ├── Toast.jsx
│   │   └── PlaylistModal.jsx
│   │
│   ├── context/
│   │   └── PlayerContext.jsx
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Discover.jsx
│   │   └── TrackDetail.jsx
│   │
│   ├── services/
│   │   └── musicService.js
│   │
│   ├── data/
│   │   └── tracks.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│
├── docs/
│   ├── wireframes/
│   │   ├── WIREFRAMES.md
│   │   ├── home_wireframe.svg
│   │   ├── dashboard_wireframe.svg
│   │   ├── discover_wireframe.svg
│   │   └── track_detail_wireframe.svg
│   └── testing/
│       └── USABILITY_TESTING.md
│
├── index.html
├── package.json
├── README.md
└── .gitignore
```

---

## 7. Design Patterns & Principles

1. **Component-Based Architecture**: Independent, reusable UI components (e.g., `MusicCard`, `TrackList`, `GenreChip`, `SearchBar`).
2. **Service Layer Pattern**: Asynchronous API logic abstracted into `musicService.js` returning Promises with simulated delay, ready for REST API replacement.
3. **Global State Provider**: `PlayerContext` manages HTML5 `<audio>` playback state, active queue, volume, likes, and playlists.
4. **Declarative UI**: Views react automatically to changes in state and URL route parameters.

---

## 8. Development Process

1. **Requirement Analysis**: Outlined functional requirements, page views, and data models.
2. **Environment Setup**: Initialized Vite React project with React Router and Lucide icons.
3. **Wireframing**: Created visual SVG wireframes for all four core pages.
4. **Data Modeling & Service Layer**: Authored `tracks.js` (15 tracks across 7 genres) and `musicService.js`.
5. **Global Context Setup**: Built `PlayerContext.jsx` for audio controls and local storage persistence.
6. **Component Library**: Implemented reusable UI components (`Navbar`, `MusicCard`, `MusicPlayer`, `SearchBar`, etc.).
7. **Page Assembly**: Developed `HomePage`, `Dashboard`, `Discover`, and `TrackDetail`.
8. **Interactivity & Audio Integration**: Connected HTML5 `<audio>` element with seek, play/pause, prev/next, and volume.
9. **Responsive Design & Dark Theme**: Applied CSS variables, glassmorphism, and media queries for desktop, tablet, and mobile.
10. **Accessibility & Usability**: Enforced WCAG guidelines, semantic tags, keyboard navigation, and ARIA labels.
11. **Testing & Verification**: Executed 15 usability test cases documented in `docs/testing/USABILITY_TESTING.md`.

---

## 9. Installation & Running Locally

### Prerequisites
- Node.js (v18.0 or higher)
- npm (v9.0 or higher)

### Steps

```bash
# 1. Navigate to project root directory
cd SoundSphere

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will launch at `http://localhost:5173`.

---

## 10. Production Build

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 11. Testing & Usability

Usability and functional testing were conducted across 15 test cases evaluating navigation, search, audio playback, playlist management, share functionality, and mobile responsiveness.

Detailed test results and matrix are documented in [`docs/testing/USABILITY_TESTING.md`](file:///Users/aniruthreddy/.gemini/antigravity-ide/scratch/SoundSphere/docs/testing/USABILITY_TESTING.md).

---

## 12. Responsive Design

SoundSphere is engineered to adapt fluidly across all screen dimensions using CSS Grid, Flexbox, and Media Queries (`@media`):
- **Desktop (1024px+)**: Full multi-column grids, detailed track tables, expanded audio player.
- **Tablet (768px - 1023px)**: Adaptive 2-column grid, compact statistics cards.
- **Mobile (<768px)**: Collapsible navigation drawer, single-column stacked layout, touch-friendly audio player controls.

---

## 13. Accessibility (a11y)

- **Semantic HTML5**: Native `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`, and `<footer>` elements.
- **ARIA Attributes**: `aria-label`, `aria-expanded`, `aria-pressed`, `aria-modal`, and `role="region"`.
- **Keyboard Navigation**: Interactive elements support tab order and `Enter`/`Space` triggers.
- **Focus Management**: Visible focus rings (`:focus-visible`) for keyboard users.
- **Color Contrast**: Compliant text-to-background contrast ratios against dark theme background.

---

## 14. Future Enhancements

- Real REST API / GraphQL backend integration (Node.js/Express or Firebase)
- User Authentication (JWT / Firebase Auth sign-in)
- Cloud music file upload & storage
- Social sharing feed and friend listening activity
- AI-powered personalized recommendation engine

---

## 15. GitHub Readiness

This repository is structured for immediate upload to GitHub:

```bash
git init
git add .
git commit -m "Initial SoundSphere project implementation"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

---

## 16. Assignment Requirement Coverage

| Requirement | Implementation Details | Status |
| :--- | :--- | :--- |
| **Front-end Web Application** | Built with React 18, Vite, JS ES6+, HTML5, CSS3 | **Satisfied** |
| **Technology Stack** | React, Vite, JavaScript, CSS3, React Router, Lucide React (No TypeScript) | **Satisfied** |
| **4 Interconnected Views** | Home (`/`), Dashboard (`/dashboard`), Discover (`/discover`), Track Detail (`/track/:id`) | **Satisfied** |
| **React Router Navigation** | Client-side routing without full page reloads | **Satisfied** |
| **Service Layer (`musicService.js`)** | Async functions (`getTracks`, `getTrackById`, `searchTracks`, `toggleLike`, etc.) returning Promises | **Satisfied** |
| **Reusable Components** | `Navbar`, `MusicCard`, `TrackList`, `MusicPlayer`, `SearchBar`, `GenreChip`, `PlaylistCard`, `Loading`, `ErrorMessage`, `Footer`, `Toast`, `PlaylistModal` | **Satisfied** |
| **Persistent Music Player** | HTML5 `<audio>` player at bottom with play/pause, prev/next, progress bar, time, volume, mute | **Satisfied** |
| **Interactive Features** | Dynamic search, genre filter, like toggle, Web Share / copy link, add to playlist | **Satisfied** |
| **Modern Dark Theme UI** | CSS custom variables (`:root`), glassmorphic design, smooth transitions, high-contrast text | **Satisfied** |
| **Responsive Web Design** | Mobile drawer menu, dynamic card grids, media queries for desktop, tablet, mobile | **Satisfied** |
| **Accessibility (a11y)** | Semantic tags, `aria-label`, visible focus states, keyboard nav, alt text | **Satisfied** |
| **Wireframes (`docs/wireframes`)** | SVG wireframe diagrams & `WIREFRAMES.md` documentation for all 4 views | **Satisfied** |
| **Usability Testing (`docs/testing`)** | `USABILITY_TESTING.md` with 15 test cases and pass/fail verification matrix | **Satisfied** |
| **Code Quality & Best Practices** | Functional components, custom hooks, modular layout, clean folder structure | **Satisfied** |
