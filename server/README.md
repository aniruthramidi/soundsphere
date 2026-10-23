# SoundSphere Backend RESTful API

Commercial-grade, high-performance RESTful API service supporting the **SoundSphere Music Streaming Platform**. Built with **Node.js**, **Express**, **SQLite**, and **JSON Web Tokens (JWT)**.

---

## 🚀 Key Features
- **Stateless JWT Authentication**: Secure user registration, login, role-based authorization (listener, creator, admin), and profile updates.
- **Relational SQLite Database**: Native zero-native-compile SQLite (`node:sqlite`) with foreign key constraints (`ON DELETE CASCADE`), indexes, and transactional queries.
- **Complete CRUD Operations**: Track catalog management, dynamic multi-field search, genre filtering, pagination, and playlist creation.
- **Interactive Music Streaming Services**: Play count recording, play history logging, and favorite liking system.
- **Aggregated User Analytics**: Real-time calculation of *Songs Played*, *Hours Listened*, *Top Genre*, and smart recommendations.
- **Automated Integration Testing**: 34 automated unit/integration tests running under 600ms via `node:test` and `supertest`.
- **Interactive OpenAPI / Swagger UI**: Built-in API explorer available at `/api/docs`.
- **Production Hardening**: Security headers (`helmet`), CORS, request logging (`morgan`), input sanitization (`express-validator`), and centralized error handling.

---

## 🛠️ Technology Stack
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: SQLite (via `node:sqlite` DatabaseSync)
- **Authentication**: JWT (`jsonwebtoken`) & bcrypt password hashing (`bcryptjs`)
- **Validation**: `express-validator`
- **API Documentation**: Swagger UI Express (`swagger-ui-express`)
- **Testing**: Node Test Runner (`node:test`, `node:assert`, `supertest`)

---

## 📋 Directory Architecture
```
server/
├── config/
│   ├── database.js          # SQLite connection, DDL schema, foreign keys, indexes
│   └── seed.js              # Initial database seed script (15 tracks, 4 playlists, users)
├── controllers/
│   ├── analyticsController.js # Aggregated metrics and listening history
│   ├── authController.js     # User registration, login, profile, passwords
│   ├── favoriteController.js # User liked songs and library
│   ├── playlistController.js # Playlist CRUD and track associations
│   └── trackController.js    # Track CRUD, search, filters, plays, likes
├── docs/
│   └── swagger.json         # OpenAPI 3.0 specification
├── middleware/
│   ├── auth.js              # JWT verification and RBAC guards
│   ├── errorHandler.js      # AppError class, 404 handler, global error handler
│   └── validator.js         # Input validation and sanitization rules
├── routes/
│   ├── analyticsRoutes.js   # /api/v1/analytics
│   ├── authRoutes.js        # /api/v1/auth
│   ├── favoriteRoutes.js    # /api/v1/favorites
│   ├── healthRoutes.js      # /api/v1/health
│   ├── playlistRoutes.js    # /api/v1/playlists
│   └── trackRoutes.js       # /api/v1/tracks
├── tests/
│   └── api.test.js          # 34 integration tests covering all endpoints
├── .env.example             # Environment variable template
├── package.json             # Backend dependencies and scripts
└── server.js                # Express application entry point
```

---

## 💾 Relational Database Schema

```
 +--------------------+       +-------------------------+       +--------------------+
 |       users        |       |     playlist_tracks     |       |       tracks       |
 +--------------------+       +-------------------------+       +--------------------+
 | id (PK)            |<--+   | id (PK)                 |   +-->| id (PK)            |
 | username (UQ)      |   |   | playlist_id (FK)        |   |   | title              |
 | email (UQ)         |   |   | track_id (FK) ----------+---+   | artist             |
 | password_hash      |   |   | position                |   |   | album              |
 | role               |   |   | added_at                |   |   | genre              |
 | avatar_url         |   |   +-------------------------+   |   | duration (sec)     |
 | bio                |   |                                 |   | artwork            |
 | created_at         |   |   +-------------------------+   |   | audio              |
 +--------------------+   |   |        playlists        |   |   | description        |
        |      |          |   +-------------------------+   |   | release_year       |
        |      |          +---| user_id (FK)            |   |   | plays              |
        |      |              | id (PK, string)         |   |   | created_by (FK)----+
        |      |              | title                   |   |   +--------------------+
        |      |              | description             |   |          |      |
        |      |              | artwork                 |   |          |      |
        |      |              | is_public               |   |          |      |
        |      |              +-------------------------+   |          |      |
        |      |                                            |          |      |
        |      |              +-------------------------+   |          |      |
        |      |              |        favorites        |   |          |      |
        |      |              +-------------------------+   |          |      |
        |      +------------->| user_id (FK)            |   |          |      |
        |                     | track_id (FK) ----------+---+          |      |
        |                     +-------------------------+              |      |
        |                                                              |      |
        |                     +-------------------------+              |      |
        |                     |      play_history       |              |      |
        |                     +-------------------------+              |      |
        +-------------------->| user_id (FK)            |              |      |
                              | track_id (FK) -------------------------+      |
                              | played_at               |                     |
                              +-------------------------+                     |
```

---

## ⚡ Quick Start & Execution Instructions

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
Navigate into the `server` folder:
```bash
cd server
npm install
```

### 3. Environment Configuration
Create your `.env` file (already preconfigured for local development):
```bash
cp .env.example .env
```
Default `.env` settings:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=soundsphere_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
DB_PATH=./data/soundsphere.db
CORS_ORIGIN=*
```

### 4. Database Seeding
Populate the database with default accounts, 15 authentic tracks, and 4 curated playlists:
```bash
npm run seed
```
**Default Seed Accounts:**
- **Regular Listener**: `alex@soundsphere.io` / `Password123!`
- **Administrator**: `admin@soundsphere.io` / `Admin123!`
- **Creator / Artist**: `artist@soundsphere.io` / `Artist123!`

### 5. Running the Server
```bash
# Production mode:
npm start

# Development mode (with auto-reload):
npm run dev
```
The server will boot on `http://localhost:5000`.

### 6. Interactive API Documentation
Open your browser and navigate to:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 🧪 Automated Testing
Run the comprehensive 34-point integration test suite:
```bash
npm test
```
**Test Coverage Matrix:**
- System health checks and metadata endpoints
- Centralized 404 AppError JSON verification
- User registration, password hashing, and validation (422)
- Duplicate email prevention (409 Conflict)
- User login and JWT token issuance
- Protected endpoints with Bearer token authentication
- User profile updates and password changes
- Track catalog pagination, searching (`q`), and genre filtering
- Track detail retrieval, creation, updating, and deletion
- Playback event logging and play count increments
- Favorite/like toggling and status checks
- Playlist CRUD, track additions, and duplicate prevention
- Listening analytics and dashboard calculations

---

## 📡 Sample cURL Requests

### Register New User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"music_fan","email":"fan@example.com","password":"Password123!"}'
```

### Log In
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@soundsphere.io","password":"Password123!"}'
```

### List Tracks (Filtered by Genre)
```bash
curl "http://localhost:5000/api/v1/tracks?genre=Electronic&limit=5"
```

### Record Track Playback
```bash
curl -X POST http://localhost:5000/api/v1/tracks/1/play
```

### Get User Dashboard Metrics
```bash
curl http://localhost:5000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```
