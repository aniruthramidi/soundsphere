# SoundSphere UI Wireframes Documentation

This document describes the initial structural wireframes designed for the SoundSphere music streaming application, detailing how layout choices and visual hierarchy guided the final React components and CSS implementation.

---

## 1. Landing / Home Page Wireframe (`home_wireframe.svg`)

### Key Components:
- **Top Navigation Bar**: Fixed header featuring brand logo, soundwave badge, navigation links (`Home`, `Discover`, `Dashboard`), and user profile trigger.
- **Hero Banner**: Eye-catching section with gradient typography, primary action ("Start Listening"), secondary action ("Explore Discover"), and visual album artwork.
- **Featured Music Grid**: Responsive card layout displaying top curated songs with hover play buttons.
- **Trending Tracks List**: Compact row-based list highlighting current top played tracks.
- **Genre Banner Cards**: Vibrant colored cards representing music categories.
- **Persistent Bottom Player**: Audio bar anchored at the bottom with track info, play/pause controls, progress seek bar, and volume controls.

### Influence on Final UI:
The wireframe established a strong top-to-bottom visual hierarchy, leading from bold brand discovery (Hero) to instant listening options (Featured & Trending) and categorical exploration (Genres).

---

## 2. User Dashboard Wireframe (`dashboard_wireframe.svg`)

### Key Components:
- **User Profile Banner**: Personalized greeting ("Welcome back, Alex!"), pro badge, and quick action buttons ("Create Playlist", "Shuffle Favorites").
- **Listening Statistics (4 Grid Cards)**:
  1. *Songs Played* (1,420)
  2. *Hours Listened* (84.5 hrs)
  3. *Favorite Genre* (Electronic)
  4. *Playlists Created* (8)
- **Recently Played Songs**: Horizontal cards carousel of recent playback history.
- **Favorite Songs (Liked Tracks)**: List component with heart status toggle and "Play All" button.
- **User & Custom Playlists**: Grid display of saved playlists with track counts.

### Influence on Final UI:
The wireframe prioritized high-level analytics and quick access. Stats cards use distinct accent colors and icons to provide an immediate overview of listening habits.

---

## 3. Discover / Search Page Wireframe (`discover_wireframe.svg`)

### Key Components:
- **Search Header & Input Bar**: Prominent search input with autofocus, clear icon, and real-time query matching across titles, artists, albums, and genres.
- **Genre Filter Chips**: Horizontal scrollable pill buttons allowing one-click genre filtering.
- **Recent Search Tags**: Quick pill tags for popular search terms.
- **View Switcher & Results**: Grid and list toggle controls with responsive track card rendering.

### Influence on Final UI:
The wireframe ensured that filtering happens instantaneously without page reloads, maintaining URL search parameters (`?genre=...`, `?query=...`) for shareable search states.

---

## 4. Music Detail Page Wireframe (`track_detail_wireframe.svg`)

### Key Components:
- **Back Navigation**: Quick button to return to the previous page.
- **Large Artwork & Metadata Hero**: Expanded album cover with high-glow drop shadow, track title, artist name, album name, release year, total plays, and genre tag.
- **Action Bar**: Large Play/Pause button, Like button, Add to Playlist modal trigger, and Web Share API / Copy Link button.
- **Track Story / Description**: Narrative background explaining the song's creation and style.
- **Related Tracks Grid**: Songs matching the same genre or artist to encourage continuous listening.

### Influence on Final UI:
The wireframe focused on immersive track details, making the large album art the central focus while keeping action buttons prominent and accessible.
