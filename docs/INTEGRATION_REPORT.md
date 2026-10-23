# SoundSphere Full-Stack Integration Report

## 1. Executive Summary
This report documents the end-to-end integration of the **SoundSphere** front-end single-page application (React 19 + Vite) with its dedicated RESTful API back-end (Node.js, Express, SQLite, and JWT). 

The integrated platform delivers a unified, high-performance music streaming experience where user actions in the browser trigger asynchronous HTTP network calls, persist state in a relational database, and dynamically refresh user interface components in real time.

---

## 2. Full-Stack System Architecture

```
+-------------------------------------------------------------------------+
|                        SOUNDSPHERE CLIENT TIER                          |
|  React 19 • Vite • React Router DOM v7 • Lucide Icons • HTML5 Audio     |
|                                                                         |
|  [Home Page]   [Discover & Search]   [Dashboard Analytics]  [TrackDetail] |
|        \                 |                   |                /         |
|         +----------------+-------------------+---------------+          |
|                                  |                                      |
|                       React Context API Provider                        |
|                       (PlayerContext.jsx State)                         |
|                                  |                                      |
|                       Service Layer Abstraction                         |
|                        (musicService.js Client)                         |
+----------------------------------+--------------------------------------+
                                   | HTTP/REST (JSON over Port 5001)
                                   | Authorization: Bearer <JWT>
                                   v
+-------------------------------------------------------------------------+
|                        SOUNDSPHERE SERVER TIER                          |
|            Node.js (v26) • Express.js • Helmet • CORS • Morgan          |
|                                                                         |
|  [Auth API]       [Tracks API]       [Playlists API]    [Analytics API] |
|  /api/v1/auth     /api/v1/tracks     /api/v1/playlists  /api/v1/analytics|
|        \                 |                   |                /         |
|         +----------------+-------------------+---------------+          |
|                                  |                                      |
|                 Middleware: JWT Verify • ExpressValidator               |
|                                  |                                      |
|                       Relational SQLite Database                        |
|                    (node:sqlite DatabaseSync Engine)                    |
|          users • tracks • playlists • playlist_tracks • favorites       |
+-------------------------------------------------------------------------+
```

---

## 3. Integration Points & API Mapping

| User Interface View / Action | Trigger / Event | Back-End API Endpoint | HTTP Method | State Updates & Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| **Initial App Hydration** | App Mount | `GET /api/v1/health` | `GET` | Verifies server connectivity; toggles `API Live` status badge in Navbar. |
| **User Authentication** | App Mount / Login | `POST /api/v1/auth/login` | `POST` | Emits JWT token saved to `localStorage`; populates `currentUser` in `PlayerContext`. |
| **Home: Featured Music** | Component Mount | `GET /api/v1/tracks?sortBy=plays&order=desc&limit=6` | `GET` | Loads top 6 played tracks from database into Featured grid. |
| **Home: Trending Tracks** | Component Mount | `GET /api/v1/tracks/trending?limit=5` | `GET` | Fetches live top 5 trending tracks. |
| **Home: Recently Added** | Component Mount | `GET /api/v1/tracks?sortBy=release_year&order=desc&limit=6` | `GET` | Loads latest releases ordered by release year. |
| **Global Audio Playback** | Track Play Trigger | `POST /api/v1/tracks/:id/play` | `POST` | Increments `plays` count in database; appends entry to `play_history` table. |
| **Like / Favorite Toggle** | Heart Icon Click | `POST /api/v1/tracks/:id/like` | `POST` | Adds or removes row from `favorites` table; updates `likedTrackIds` set in state. |
| **Discover: Search** | Query Input Change | `GET /api/v1/tracks?q=:query` | `GET` | Filters tracks matching title, artist, or album on the server. |
| **Discover: Genre Filter** | Genre Tag Click | `GET /api/v1/tracks?genre=:genre` | `GET` | Retrieves server-indexed tracks matching selected musical genre. |
| **Track Detail View** | Route `/track/:id` | `GET /api/v1/tracks/:id` | `GET` | Fetches complete metadata, audio stream, creator info, and user's liked status. |
| **Dashboard Analytics** | Route `/dashboard` | `GET /api/v1/analytics/dashboard` | `GET` | Aggregates *Songs Played*, *Hours Listened*, *Favorite Genre*, and *Playlists*. |
| **Playlist Creation** | Playlist Modal Submit | `POST /api/v1/playlists` | `POST` | Inserts new playlist record into database; refreshes `userPlaylists` list. |
| **Add Track to Playlist** | Context Action | `POST /api/v1/playlists/:id/tracks` | `POST` | Inserts row into `playlist_tracks` table with position ordering; prevents duplicates. |

---

## 4. State Management & Asynchronous Data Flow

The integration uses a **hybrid React Context + Service Layer architecture**:

1. **Service Layer (`musicService.js`)**:
   - Centralizes all network requests to `http://localhost:5001/api/v1`.
   - Automatically injects JWT Bearer tokens via `getAuthHeaders()`.
   - Incorporates **defensive fallback**: if the backend server is unreachable or offline, functions seamlessly fallback to browser `localStorage` and bundled mock data without throwing unhandled exceptions.

2. **React Context (`PlayerContext.jsx`)**:
   - Manages global state including `currentTrack`, `isPlaying`, `queue`, `currentIndex`, `volume`, `isMuted`, `currentTime`, `duration`, `likedTrackIds`, `userPlaylists`, `currentUser`, and `isBackendConnected`.
   - Provides consumer hooks (`usePlayer()`) enabling any component across the application to trigger audio playback, like toggles, playlist management, and toast notifications.

---

## 5. Challenges Encountered & Solutions Implemented

### Challenge 1: Port Collision with macOS AirPlay Receiver
- **Issue**: By default, Node.js servers often select port `5000`. On macOS Monterey, Ventura, Sonoma, and Sequoia, Apple's `ControlCenter` (AirPlay Receiver) listens on `0.0.0.0:5000`, causing `EADDRINUSE: address already in use :::5000`.
- **Solution**: Reconfigured the backend to port `5001` across `.env`, `.env.example`, and `server.js`, while configuring the client service layer to target `5001` by default.

### Challenge 2: Cross-Origin Resource Sharing (CORS) & Credentials
- **Issue**: Running the Vite dev server on `http://localhost:5173` and the Express backend on `http://localhost:5001` introduced cross-origin preflight requests (`OPTIONS`).
- **Solution**: Configured Express `cors()` middleware with permissible headers (`Authorization`, `Content-Type`) and dynamic origin support (`*` in development).

### Challenge 3: Synchronizing Optimistic UI State with Database State
- **Issue**: Liking a track or adding a track to a playlist should provide immediate tactile feedback without waiting for network round-trips, but must remain consistent if the server rejects the request.
- **Solution**: Implemented optimistic updates in `PlayerContext`: state is updated immediately with a toast notification, while the asynchronous API call executes in the background. If the request fails, the state gracefully rolls back.

### Challenge 4: Real-Time Listening History & Play Count Increments
- **Issue**: Calling audio playback should log a play event without interrupting audio buffering or freezing the client UI.
- **Solution**: Utilized asynchronous "fire-and-forget" network logging in `musicService.recordPlay(id)`. Playback starts instantaneously in HTML5 audio, while the HTTP POST executes concurrently.

---

## 6. Local Setup & Execution Guide

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v9.0.0 or higher

### Running Full-Stack Locally
Run both servers simultaneously:

```bash
# Terminal 1: Start Backend REST API Server (Port 5001)
npm run server

# Terminal 2: Start Front-End Vite Dev Server (Port 5173)
npm run dev
```

Open your browser:
- **Web Application**: `http://localhost:5173/`
- **Interactive Swagger Documentation**: `http://localhost:5001/api/docs`
- **Health Check**: `http://localhost:5001/api/v1/health`

### Automated Integration Testing
Run the 34-point backend integration test suite:
```bash
npm run server:test
```

---

## 7. Video Demonstration Walkthrough

A complete screen recording of the full-stack integrated application in action is included in the project:
- **Video File**: `demo/soundsphere_fullstack_demo.webp` (and in your `Downloads` directory)
- **Demonstrated Workflows**:
  1. Home page rendering with live catalog data and "API Live" connection badge.
  2. Audio playback initiation with live play count tracking.
  3. Interactive favorite liking and unliking with toast notifications.
  4. Real-time search filtering and genre categorization on the Discover page.
  5. Dashboard navigation displaying real-time aggregated metrics from SQLite.
  6. Dynamic track detail routing inspecting track information.
