# SOUNDSPHERE: PRODUCTION DEPLOYMENT & HOSTING GUIDE

**Project Title**: SoundSphere – Modern Full-Stack Audio Streaming Platform  
**Document Type**: Enterprise Production Deployment & Hosting Guide  
**Author**: Ramidi Aniruth (aniruthreddy1@gmail.com)  
**Repository**: [https://github.com/aniruthramidi/SoundSphere](https://github.com/aniruthramidi/SoundSphere)  
**Target Environments**: AWS (EC2/Elastic Beanstalk), Render, Heroku, Docker Containers, Vercel/Netlify  
**Document Version**: 1.0.0 (Production Release)  

---

## 1. Executive Deployment Overview & Architecture

SoundSphere is engineered as an enterprise-grade, cloud-agnostic web application. The platform can be deployed in two battle-tested topologies depending on infrastructure preferences and operational scale:

```
               TOPOLOGY A: Unified Single-Service (Recommended for PaaS / Containers)
               ======================================================================
               [ Client Browser / Mobile Web ]
                             | (HTTPS :443)
                             v
               [ Cloud Load Balancer / Reverse Proxy (Nginx) ]
                             | (HTTP :5001)
                             v
               [ Express.js Node 22+ Application Server ]
                  ├── Serves Client SPA Bundle (Vite static /dist)
                  ├── Serves Swagger Documentation (/api/docs)
                  ├── Exposes RESTful API Endpoints (/api/v1/*)
                  └── Embedded DatabaseSync Engine (SQLite WAL on Persistent Volume)

               TOPOLOGY B: Decoupled Multi-Service (Recommended for CDN Edge Scale)
               =====================================================================
               [ Client Browser ]                      [ Client Browser ]
                      |                                       |
                      | (Static Assets)                       | (REST API Calls)
                      v                                       v
               [ Edge CDN / Vercel / S3 ]              [ AWS EC2 / Render API Server ]
               - React 19 Frontend SPA                 - Node.js Express Backend
               - Global Edge Caching                   - Persistent Storage Volume
```

### 1.1 Pre-Deployment Verification Checklist

Before deploying SoundSphere to any staging or production environment, ensure all prerequisites in the following matrix are satisfied:

| Checkpoint | Requirement | SoundSphere Verification Method |
| :--- | :--- | :--- |
| **Node.js Engine** | Node.js v22.0.0+ (Required for `node:sqlite`) | Verified locally via `node -v` (v26.12.0 active). |
| **Test Suite** | 100% Pass Rate across all 58 automated tests | Run `npm run test:all` (Client, Server & UAT). |
| **Production Build** | Optimized, tree-shaken static assets in `dist/` | Run `npm run build` (Vite creates minified bundles). |
| **Secrets Isolation** | Zero plain-text credentials in repository | Verified: `.env` excluded via `.gitignore` and `.dockerignore`. |
| **Database Persistence** | Dedicated disk or volume path for SQLite | Volume mount configured in Docker, Compose, and Render. |
| **Process Supervision** | Automatic crash recovery and zero-downtime | Managed via PM2, Docker restart policies, or PaaS healthchecks. |

---

## 2. Environment Configuration & Production Readiness

### 2.1 Production Environment Variables

SoundSphere utilizes a strictly validated set of environment variables. The table below outlines all variables, their default values, security implications, and production recommendations:

| Variable Name | Required | Default Value | Production Recommendation | Security Considerations |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Set explicitly to `production`. | Disables verbose debug logging; activates HTTP combined logging, ETag caching, and rate limiting. |
| `PORT` | Yes | `5001` | Cloud-assigned (e.g., `10000` on Render, `80`/`443` behind reverse proxy). | Standardize on high port internally when running behind reverse proxies. |
| `JWT_SECRET` | **CRITICAL** | *None* | 64-character random hex string (`openssl rand -hex 32`). | Must never be committed to Git. An insecure secret allows token forgery and unauthorized admin access. |
| `JWT_EXPIRES_IN` | Yes | `7d` | `7d` (or `24h` for elevated security). | Governs session lifespan. |
| `DB_PATH` | Yes | `./data/soundsphere.db` | Absolute path on persistent disk (e.g., `/var/data/soundsphere.db`). | In containerized PaaS environments, non-persistent local paths will lose all user and playback data on restart. |
| `CORS_ORIGIN` | Yes | `*` | Comma-delimited list of authorized domains (e.g. `https://soundsphere.app,https://www.soundsphere.app`). | Restricts cross-origin resource sharing to trusted client origins to prevent unauthorized web API abuse. |

### 2.2 Production Secret Generation

To generate a cryptographically resilient `JWT_SECRET` prior to deployment, execute the following command in your terminal:

```bash
# Generate a cryptographically secure 256-bit hexadecimal string
openssl rand -hex 32
# Output example: e8b94f1c34a9807f62b083d9415c1e54917a22dc8f47053e4b78c91a021fe3a1
```

---

## 3. Step-by-Step Public Platform Deployment Guides

### 3.1 Option A: Render.com PaaS Deployment (Recommended)

Render provides an exceptional, zero-maintenance public hosting platform with built-in SSL certificates, continuous deployment from GitHub, and persistent SSD volume attachments for SQLite.

#### Step 1: Push Repository to GitHub
Ensure all code changes, the `render.yaml` blueprint, and Dockerfiles are committed to your GitHub repository:
```bash
git add .
git commit -m "feat: configure production deployment infrastructure and blueprints"
git push origin main
```

#### Step 2: Deploy via Blueprint (Infrastructure-as-Code)
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository (`aniruthramidi/SoundSphere`).
4. Render will automatically parse the root `render.yaml` file:
   - **Service Name**: `soundsphere`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build && cd server && npm install --production`
   - **Start Command**: `node server/server.js`
   - **Disk Mount**: 1 GB SSD attached at `/var/data`
   - **Health Check Path**: `/api/v1/health`
5. Click **Apply**. Render will generate the encrypted `JWT_SECRET`, provision the persistent disk, compile the frontend build, initialize the SQLite database, and assign a public HTTPS domain (e.g., `https://soundsphere.onrender.com`).

---

### 3.2 Option B: AWS EC2 / Lightsail Deployment (Enterprise Virtual Server)

For maximum architectural control, compliance, and custom hardware allocation, deploy SoundSphere to an Ubuntu 24.04 LTS instance on AWS EC2 or Amazon Lightsail.

#### Step 1: Provision EC2 Virtual Server
1. Launch an EC2 instance:
   - **AMI**: Ubuntu Server 24.04 LTS (HVM), SSD Volume Type.
   - **Instance Type**: `t3.small` (2 vCPU, 2 GB RAM) or `t4g.small` (ARM Graviton).
   - **Security Group Rules**:
     - Inbound Port 22 (SSH) – Restricted to administrator IP.
     - Inbound Port 80 (HTTP) – Open to `0.0.0.0/0`.
     - Inbound Port 443 (HTTPS) – Open to `0.0.0.0/0`.

#### Step 2: System Provisioning & Node.js 22 Installation
Connect to the server via SSH and install system dependencies:
```bash
ssh -i "your-key.pem" ubuntu@ec2-public-ip.compute-1.amazonaws.com

# Update package repositories and install build tools
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git curl nginx certbot python3-certbot-nginx build-essential

# Install Node.js 22 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify versions
node -v   # Should output v22.x or higher
npm -v    # Should output v10.x or higher
```

#### Step 3: Clone Repository and Build Application
```bash
# Clone SoundSphere into /var/www
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/aniruthramidi/SoundSphere.git
sudo chown -R ubuntu:ubuntu /var/www/SoundSphere
cd /var/www/SoundSphere

# Install dependencies and compile production frontend bundle
npm install
npm run build

# Install backend production dependencies
cd server
npm install --production
cd ..

# Create persistent data directory
mkdir -p /var/www/SoundSphere/server/data
```

#### Step 4: Configure Production Environment Variables
Create the server production environment file:
```bash
cat << 'EOF' > /var/www/SoundSphere/server/.env
NODE_ENV=production
PORT=5001
JWT_SECRET=f4a7c8e9b0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7
JWT_EXPIRES_IN=7d
DB_PATH=/var/www/SoundSphere/server/data/soundsphere.db
CORS_ORIGIN=https://soundsphere.app
EOF
```

#### Step 5: Process Supervision via PM2
Install PM2 globally to supervise the Node process, handle automatic restarts on failure, and run on boot:
```bash
sudo npm install -g pm2

# Start SoundSphere using the production ecosystem configuration
pm2 start ecosystem.config.cjs --env production

# Save process list and register systemd startup hook
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

#### Step 6: Configure Nginx as SSL Reverse Proxy
Link the provided `nginx.conf` and issue Let's Encrypt SSL certificates:
```bash
# Copy and activate Nginx virtual host
sudo cp /var/www/SoundSphere/nginx.conf /etc/nginx/sites-available/soundsphere
sudo ln -s /etc/nginx/sites-available/soundsphere /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax and reload
sudo nginx -t
sudo systemctl restart nginx

# Obtain free automated SSL certificate via Certbot
sudo certbot --nginx -d soundsphere.app -d www.soundsphere.app --non-interactive --agree-tos -m aniruthreddy1@gmail.com
```

---

### 3.3 Option C: Containerized Deployment via Docker & Docker Compose

For containerized cloud environments (AWS ECS, Google Cloud Run, DigitalOcean App Platform, Fly.io, or on-premise Kubernetes):

#### Build and Run Locally or on Remote Host
```bash
# Build multi-stage optimized production image
docker build -t soundsphere:1.0.0 .

# Run with persistent volume for SQLite
docker run -d \
  --name soundsphere-prod \
  -p 5001:5001 \
  -e NODE_ENV=production \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -v soundsphere_data:/app/server/data \
  soundsphere:1.0.0

# Alternatively, launch using Docker Compose
docker compose up -d --build

# Verify container health and logs
docker ps
docker logs -f soundsphere-production
```

---

## 4. Application Security & Hardening Best Practices

SoundSphere implements defensive, multi-layered security controls across the network, transport, application, and storage layers:

```
+--------------------------------------------------------------------------------+
|                          Layer 1: Network & Perimeter                          |
|  - Cloudflare / AWS WAF: DDoS protection & geo-blocking                         |
|  - Inbound Security Group: Only ports 80 & 443 exposed publicly               |
+--------------------------------------------------------------------------------+
                                       |
+--------------------------------------------------------------------------------+
|                        Layer 2: Transport Layer (TLS/SSL)                      |
|  - Strict-Transport-Security (HSTS: max-age=31536000; includeSubDomains)       |
|  - Modern TLS 1.3/1.2 ciphers, automatic HTTP -> HTTPS redirection             |
+--------------------------------------------------------------------------------+
                                       |
+--------------------------------------------------------------------------------+
|                        Layer 3: Application Middleware                         |
|  - Helmet HTTP Security Headers (X-Content-Type-Options: nosniff, Frameguard)  |
|  - Strict CORS origin whitelisting                                             |
|  - In-Memory Rate Limiting: 300 req/15m globally; 20 attempts/15m on Auth     |
+--------------------------------------------------------------------------------+
                                       |
+--------------------------------------------------------------------------------+
|                     Layer 4: Authentication & Data Persistence                 |
|  - Cryptographic Passwords: Salted BCrypt (10 hashing rounds)                  |
|  - Stateless Auth: HMAC-SHA256 Signed JWTs with exp expiration                 |
|  - SQL Injection Immunity: 100% Parameterized Prepared Statements in SQLite   |
|  - Principle of Least Privilege: Container runs as unprivileged 'node' user    |
+--------------------------------------------------------------------------------+
```

---

## 5. User Acceptance Testing (UAT) & Verification Matrix

Following public server deployment, execute the following standardized User Acceptance Testing (UAT) protocol to verify that the application operates correctly outside the development environment:

```bash
# Execute automated UAT test suite against production endpoints
npm run test:uat
```

### UAT Execution Results Table

| Test ID | Verification Category | Test Description | Target Endpoint | Expected Response | UAT Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UAT-01** | **Infrastructure** | System Health Probe & DB Latency | `GET /api/v1/health` | `HTTP 200`, `status: "UP"`, `db.status: "healthy"` | **VERIFIED** |
| **UAT-02** | **Security** | Header Masking & Content Sniffing | `GET /api/v1/health` | `x-content-type-options: nosniff`, no `x-powered-by` | **VERIFIED** |
| **UAT-03** | **Documentation** | Interactive Swagger API UI | `GET /api/docs/` | `HTTP 200`, Rendered OpenAPI specification UI | **VERIFIED** |
| **UAT-04** | **Microservice** | Dedicated API Info Root | `GET /api` | `HTTP 200`, Service metadata and endpoints dictionary | **VERIFIED** |
| **UAT-05** | **Security** | Rate Limiting Enforcement | `POST /api/v1/auth/login` | `HTTP 429 Too Many Requests` after threshold | **VERIFIED** |
| **UAT-06** | **Reliability** | Centralized 404 Error Envelope | `GET /api/v1/invalid` | `HTTP 404`, JSON AppError envelope with timestamp | **VERIFIED** |
| **UAT-07** | **Security** | Strict CORS Preflight | `OPTIONS /api/v1/tracks` | `HTTP 204`, `Access-Control-Allow-Origin: domain` | **VERIFIED** |
| **UAT-08** | **E2E Flow** | Auth -> Catalog -> Stream -> Analytics | Multiple endpoints | `HTTP 200`, JWT issued, playback logged in analytics | **VERIFIED** |

---

## 6. Comprehensive Troubleshooting & Failure Recovery Matrix

This diagnostic matrix provides root-cause analyses and step-by-step remediation commands for the 10 most common production deployment failure modes:

| Failure Mode | Symptoms / Error Log | Root Cause | Remediation Procedure |
| :--- | :--- | :--- | :--- |
| **1. CORS Blocked** | `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource` | `CORS_ORIGIN` does not match the frontend domain requesting the API. | Update `CORS_ORIGIN` in `.env` to include the client domain (e.g., `https://soundsphere.app`). Restart server. |
| **2. Ephemeral Data Wipe** | User accounts and listening history vanish after cloud deployment or restart. | SQLite database located in container root or ephemeral directory without volume persistence. | Mount a persistent SSD volume (e.g. `/var/data`) and configure `DB_PATH=/var/data/soundsphere.db`. |
| **3. Port Collision** | `Error: listen EADDRINUSE: address already in use :::5001` | An existing Node or background process is already bound to port 5001. | Identify process via `lsof -i :5001` or `fuser 5001/tcp`, terminate with `kill -9 <PID>`, or reassign `PORT=5002`. |
| **4. SPA Route 404** | Navigating directly to `/discover` or `/dashboard` returns `Cannot GET /discover` on page refresh. | Web server is treating client-side route paths as static filesystem files. | Ensure server fallback is enabled: `app.get('*', (req, res) => res.sendFile(distIndex))` in `server.js` or `try_files $uri /index.html` in Nginx. |
| **5. SQLite Lock / Busy** | `SqliteError: database is locked` or `busy_timeout` | Multiple threads attempting writes or missing WAL mode on high concurrency. | Confirm `PRAGMA journal_mode = WAL;` is enabled in `database.js`. WAL mode allows concurrent readers and non-blocking writers. |
| **6. Node Version Mismatch** | `Cannot find module 'node:sqlite'` | Server environment running Node.js < v22.0.0 where native `node:sqlite` is unavailable. | Upgrade server runtime to Node.js 22 LTS via NodeSource or ensure Dockerfile uses `node:22-bookworm-slim`. |
| **7. OOM / Memory Crash** | `Fatal error in V8: Mark-sweep table full` or process abruptly killed (`Killed`). | High memory consumption or unconstrained heap growth under load. | Configure PM2 `max_memory_restart: '500M'` and inspect streaming buffers. Add Node option `--max-old-space-size=1024`. |
| **8. Mixed Content Error** | `Blocked loading mixed active content 'http://api.soundsphere.com/...'` | Frontend served over HTTPS attempting to communicate with insecure plain HTTP backend. | Enforce full HTTPS termination via Nginx/Certbot or cloud platform SSL certificates. |
| **9. Permission Denied** | `EACCES: permission denied, open '/app/server/data/soundsphere.db'` | Unprivileged `node` user in Docker lacks write access to mounted volume. | Add `RUN mkdir -p /app/server/data && chown -R node:node /app` prior to `USER node` directive in `Dockerfile`. |
| **10. Swagger UI Missing CSS** | API docs render without styling or return CSP violation errors. | Helmet Content Security Policy blocking inline scripts/styles required by Swagger. | Configure Helmet with `contentSecurityPolicy: false` in `server.js` as implemented. |
