# SoundSphere RESTful API Documentation

## Executive Overview
The **SoundSphere RESTful API** provides robust, scalable, commercial-grade backend services for the SoundSphere Music Streaming Web Application. Built on **Node.js** and **Express**, the API interacts with a high-performance relational **SQLite** database using native `node:sqlite` bindings with enforced foreign key integrity and indexing.

- **Base URL**: `http://localhost:5000/api/v1`
- **Interactive Swagger UI**: `http://localhost:5000/api/docs`
- **Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`)
- **Default Port**: `5000`
- **Format**: JSON (`Content-Type: application/json`)

---

## Architecture & Security Principles
1. **Stateless JWT Authentication**: Secure HMAC-SHA256 tokens carrying user claims (`id`, `username`, `email`, `role`).
2. **Password Security**: Cryptographically salted passwords hashed with **bcryptjs** (10 salt rounds).
3. **Role-Based Access Control (RBAC)**: Fine-grained permissions for `listener`, `creator`, and `admin` roles.
4. **Relational Database Integrity**: Cascading foreign keys (`ON DELETE CASCADE`), unique constraints, and optimized B-Tree indexes.
5. **Standardized Response Envelope**: Predictable JSON responses across all success and error states.
6. **Robust Input Validation**: Strict parameter, body, and query validation via `express-validator` with `422 Unprocessable Entity` details.
7. **Production Hardening**: Security headers via `helmet`, configurable `cors`, and centralized error boundary.

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "status": "fail",
  "statusCode": 400,
  "message": "Specific error description",
  "details": [
    {
      "field": "email",
      "message": "Must provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

---

## Authentication Endpoints (`/api/v1/auth`)

### 1. Register User
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Auth Required**: No
- **Request Body**:
```json
{
  "username": "alex_vance",
  "email": "alex@soundsphere.io",
  "password": "Password123!",
  "role": "listener",
  "bio": "Audiophile and electronic music enthusiast"
}
```
- **Validation Rules**:
  - `username`: 3–30 alphanumeric characters and underscores
  - `email`: valid RFC 5322 email format
  - `password`: minimum 6 characters
  - `role`: optional, one of `listener`, `creator`, `admin`
- **Responses**:
  - `201 Created`: User created, returns user profile and JWT token.
  - `409 Conflict`: Email or username already registered.
  - `422 Unprocessable Entity`: Validation failure.

### 2. Login User
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "alex@soundsphere.io",
  "password": "Password123!"
}
```
- **Responses**:
  - `200 OK`:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "alex_vance",
    "email": "alex@soundsphere.io",
    "role": "listener",
    "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
    "bio": "Passionate audiophile, electronic music curator, and daily SoundSphere listener.",
    "created_at": "2026-10-01 12:00:00"
  }
}
```
  - `401 Unauthorized`: Invalid credentials.

### 3. Get Authenticated Profile
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Responses**:
  - `200 OK`: Returns sanitized user details.
  - `401 Unauthorized`: Missing or expired token.

### 4. Update Profile
- **Method**: `PUT`
- **Path**: `/api/v1/auth/profile`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "username": "alex_vance_pro",
  "bio": "Curating high-fidelity audio streams daily.",
  "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
}
```
- **Responses**:
  - `200 OK`: Updated profile.
  - `409 Conflict`: Username already taken.

### 5. Change Password
- **Method**: `PUT`
- **Path**: `/api/v1/auth/password`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecurePassword456!"
}
```
- **Responses**:
  - `200 OK`: Password updated successfully.
  - `400 Bad Request`: Incorrect current password.

---

## Tracks Endpoints (`/api/v1/tracks`)

### 1. List Tracks (Search, Filter, Pagination)
- **Method**: `GET`
- **Path**: `/api/v1/tracks`
- **Auth Required**: Optional (when authenticated, includes personalized `liked` boolean)
- **Query Parameters**:
  - `q` (string): Keyword matching title, artist, or album.
  - `genre` (string): Exact genre name (e.g. `Electronic`, `Classical`, `Pop`, `Jazz`).
  - `sortBy` (string): Field to sort (`id`, `title`, `artist`, `plays`, `release_year`, `duration`). Default: `id`.
  - `order` (string): `asc` or `desc`. Default: `asc`.
  - `page` (integer): Page number. Default: `1`.
  - `limit` (integer): Records per page (max 100). Default: `50`.
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 2,
  "total": 15,
  "page": 1,
  "totalPages": 8,
  "data": [
    {
      "id": 1,
      "title": "Midnight Cyberspace",
      "artist": "Aetheria",
      "album": "Neon Dreams",
      "genre": "Electronic",
      "duration": 214,
      "artwork": "/artwork/midnight_cyberspace.jpg",
      "audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      "description": "A pulsating synthwave track blending analog synths with futuristic sub-bass.",
      "release_year": 2024,
      "plays": 1420500,
      "liked": true
    }
  ]
}
```

### 2. Get Track Details by ID
- **Method**: `GET`
- **Path**: `/api/v1/tracks/:id`
- **Auth Required**: Optional
- **Responses**:
  - `200 OK`: Full track metadata with like status and creator info.
  - `404 Not Found`: Track ID not found.

### 3. Create Track
- **Method**: `POST`
- **Path**: `/api/v1/tracks`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
```json
{
  "title": "Solar Flares",
  "artist": "Nova Pulse",
  "album": "Celestial Odyssey",
  "genre": "Electronic",
  "duration": 198,
  "audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
  "artwork": "/artwork/solar_flares.jpg",
  "description": "Cosmic synthwave adventure.",
  "release_year": 2026
}
```
- **Responses**:
  - `201 Created`: Track created successfully.
  - `422 Unprocessable Entity`: Validation failure.

### 4. Update Track
- **Method**: `PUT`
- **Path**: `/api/v1/tracks/:id`
- **Auth Required**: Yes (Creator of track or Admin)
- **Responses**:
  - `200 OK`: Track updated.
  - `403 Forbidden`: Unauthorized to edit this track.
  - `404 Not Found`: Track not found.

### 5. Delete Track
- **Method**: `DELETE`
- **Path**: `/api/v1/tracks/:id`
- **Auth Required**: Yes (Creator of track or Admin)
- **Responses**:
  - `200 OK`: Track deleted.

### 6. Record Play Event
- **Method**: `POST`
- **Path**: `/api/v1/tracks/:id/play`
- **Auth Required**: Optional (logs user ID if logged in, otherwise anonymous)
- **Responses**:
  - `200 OK`:
```json
{
  "success": true,
  "message": "Playback logged successfully",
  "data": {
    "trackId": 1,
    "plays": 1420501
  }
}
```

### 7. Toggle Like / Favorite
- **Method**: `POST`
- **Path**: `/api/v1/tracks/:id/like`
- **Auth Required**: Yes
- **Responses**:
  - `200 OK`:
```json
{
  "success": true,
  "liked": true,
  "message": "Track added to favorites"
}
```

### 8. Trending Tracks
- **Method**: `GET`
- **Path**: `/api/v1/tracks/trending?limit=5`
- **Auth Required**: Optional
- **Responses**:
  - `200 OK`: Top played tracks.

### 9. Distinct Genres Catalog
- **Method**: `GET`
- **Path**: `/api/v1/tracks/genres`
- **Auth Required**: No
- **Responses**:
  - `200 OK`: Array of `{ genre: string, track_count: number }`.

---

## Playlists Endpoints (`/api/v1/playlists`)

### 1. List Playlists
- **Method**: `GET`
- **Path**: `/api/v1/playlists`
- **Auth Required**: Optional (returns public playlists + user's private playlists)
- **Responses**: `200 OK`

### 2. Get Playlist by ID
- **Method**: `GET`
- **Path**: `/api/v1/playlists/:id`
- **Auth Required**: Optional (private playlists require owner or admin)
- **Responses**:
  - `200 OK`: Playlist object with array of populated track objects.
  - `403 Forbidden`: Private playlist without authorization.
  - `404 Not Found`: Playlist not found.

### 3. Create Playlist
- **Method**: `POST`
- **Path**: `/api/v1/playlists`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "title": "Night Driving Focus",
  "description": "Chill electronic beats for late night drives",
  "artwork": "/artwork/midnight_cyberspace.jpg",
  "is_public": true,
  "trackIds": [1, 2, 8]
}
```
- **Responses**: `201 Created`

### 4. Add Track to Playlist
- **Method**: `POST`
- **Path**: `/api/v1/playlists/:id/tracks`
- **Auth Required**: Yes (Owner or Admin)
- **Request Body**:
```json
{
  "track_id": 4
}
```
- **Responses**:
  - `201 Created`: Track added.
  - `409 Conflict`: Track already in playlist.

### 5. Remove Track from Playlist
- **Method**: `DELETE`
- **Path**: `/api/v1/playlists/:id/tracks/:trackId`
- **Auth Required**: Yes (Owner or Admin)
- **Responses**: `200 OK`

### 6. Delete Playlist
- **Method**: `DELETE`
- **Path**: `/api/v1/playlists/:id`
- **Auth Required**: Yes (Owner or Admin)
- **Responses**: `200 OK`

---

## Favorites / User Library (`/api/v1/favorites`)

### 1. Get User Favorites
- **Method**: `GET`
- **Path**: `/api/v1/favorites`
- **Auth Required**: Yes
- **Responses**: `200 OK` with array of favorited tracks ordered by timestamp.

### 2. Check Favorite Status
- **Method**: `GET`
- **Path**: `/api/v1/favorites/check/:trackId`
- **Auth Required**: Yes
- **Responses**: `200 OK` with `{ liked: true/false }`.

---

## Analytics & Dashboard (`/api/v1/analytics`)

### 1. Get Dashboard Analytics
- **Method**: `GET`
- **Path**: `/api/v1/analytics/dashboard`
- **Auth Required**: Yes
- **Responses**: `200 OK`
```json
{
  "success": true,
  "data": {
    "stats": {
      "songsPlayed": 42,
      "hoursListened": 3.8,
      "totalSeconds": 13680,
      "favoriteGenre": "Electronic",
      "playlistsCreated": 4,
      "favoritesCount": 5
    },
    "recentlyPlayed": [ ... ],
    "recommendations": [ ... ]
  }
}
```

### 2. Get Listening History
- **Method**: `GET`
- **Path**: `/api/v1/analytics/history?page=1&limit=20`
- **Auth Required**: Yes
- **Responses**: `200 OK` with paginated playback events and track details.

---

## System Health Check (`/api/v1/health`)
- **Method**: `GET`
- **Path**: `/api/v1/health`
- **Auth Required**: No
- **Responses**: `200 OK`
```json
{
  "status": "UP",
  "service": "SoundSphere REST API",
  "version": "1.0.0",
  "timestamp": "2026-10-23T14:45:00.000Z",
  "uptimeSeconds": 1420,
  "environment": "development",
  "database": {
    "engine": "SQLite (node:sqlite)",
    "status": "healthy",
    "latencyMs": 0.04
  },
  "system": {
    "nodeVersion": "v26.12.0",
    "platform": "darwin",
    "arch": "arm64",
    "heapUsedMB": "24.15"
  }
}
```
