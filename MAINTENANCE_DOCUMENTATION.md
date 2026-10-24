# SOUNDSPHERE: APPLICATION MAINTENANCE & OPERATIONAL STRATEGY

**Project Title**: SoundSphere – Modern Full-Stack Audio Streaming Platform  
**Document Type**: Enterprise Production Maintenance, Telemetry & Disaster Recovery Manual  
**Author**: Ramidi Aniruth (aniruthreddy1@gmail.com)  
**Repository**: [https://github.com/aniruthramidi/SoundSphere](https://github.com/aniruthramidi/SoundSphere)  
**Target Audience**: DevOps Engineers, Site Reliability Engineers (SRE), Full-Stack Maintainers  
**Document Version**: 1.0.0 (Production Release)  

---

## 1. Production Monitoring & Telemetry Architecture

Operating an audio streaming platform requires continuous visibility into server responsiveness, playback latency, database lock contention, and client connectivity. SoundSphere utilizes a multi-tiered monitoring stack:

```
               [ User Request ]
                      |
                      v
       [ Nginx Reverse Proxy / Load Balancer ]
          │  - Access logging (IP, latency, status)
          │  - SSL handshake metrics
          v
       [ Express.js Application Server ]
          │  - Morgan HTTP Request Logger (Dev / Combined formats)
          │  - Custom Health & Telemetry Probe (/api/v1/health)
          │  - Centralized Error Handler (AppError envelope)
          v
       [ Embedded SQLite Database Engine ]
          │  - PRAGMA journal_mode = WAL; (Write-Ahead Logging)
          │  - Query latency profiling (< 1ms average)
          │  - Lock contention metrics
          v
       [ External Monitoring & Alerting Services ]
          ├── Uptime Monitoring (BetterStack / UptimeRobot / Pingdom)
          ├── Exception Tracking (Sentry SDK integration blueprint)
          └── Process Supervision (PM2 / Docker Healthcheck / CloudWatch)
```

### 1.1 Core Key Performance Indicators (KPIs) & Health SLAs

To guarantee high availability and user satisfaction, the operations team monitors the following operational thresholds:

| Metric Category | Target Indicator | Warning Threshold | Critical Incident Threshold | Action Triggered |
| :--- | :--- | :--- | :--- | :--- |
| **System Availability** | **Uptime SLA** | `< 99.95%` over 30 days | `< 99.50%` | Immediate Sev-1 on-call page; automated restart. |
| **API Response Time** | **p95 Latency** | `> 250 ms` | `> 1000 ms` | Inspect SQLite WAL file locks and slow queries. |
| **Database Probe** | **DB Ping Latency** | `> 10 ms` | `> 50 ms` (or `unhealthy`) | Run database integrity check; execute WAL checkpoint. |
| **Error Rate** | **HTTP 5xx Server Errors** | `> 0.5%` of total requests | `> 2.0%` of requests | Analyze error logs; initiate rollback if after deployment. |
| **Memory Footprint** | **Node.js Heap Used** | `> 350 MB` | `> 450 MB` | PM2 automatic soft restart (`max_memory_restart: 500M`). |
| **Rate Limit Hits** | **HTTP 429 Statuses** | `> 50 / hour` | `> 500 / hour` | Inspect client IP traffic for distributed credential stuffing. |

### 1.2 Automated Health Probe Verification (`/api/v1/health`)

SoundSphere exposes an unauthenticated, zero-overhead diagnostic endpoint at `/api/v1/health`. Cloud orchestrators and external ping monitors query this endpoint every 30 seconds.

**Sample Health Payload**:
```json
{
  "status": "UP",
  "service": "SoundSphere REST API",
  "version": "1.0.0",
  "timestamp": "2026-10-24T14:02:18.491Z",
  "uptimeSeconds": 86420,
  "environment": "production",
  "database": {
    "engine": "SQLite (node:sqlite)",
    "status": "healthy",
    "latencyMs": 0.42
  },
  "system": {
    "nodeVersion": "v26.12.0",
    "platform": "linux",
    "arch": "x64",
    "heapUsedMB": "18.45"
  }
}
```

---

## 2. Centralized Logging & Error Reporting

### 2.1 Logging Architecture & Formats

SoundSphere employs environment-aware logging to balance developer visibility with production performance and privacy:

1. **Development Environment**: Employs Morgan `dev` colorized concise formatting (`GET /api/v1/tracks 200 4.12 ms`).
2. **Production Environment**: Employs Morgan `combined` Apache/Nginx standard format containing remote client IP, timestamp, HTTP verb, URL path, response status, content length, referrer, and user-agent.
3. **Structured Application Errors**: All unhandled exceptions and operational failures are routed through the centralized `errorHandler` middleware, outputting structured JSON logs containing:
   - `statusCode`: HTTP status code (e.g., 404, 409, 422, 500)
   - `message`: Descriptive, user-safe error message
   - `timestamp`: ISO-8601 millisecond timestamp
   - `details`: Validation error array or contextual information (omits stack trace in production for security).

### 2.2 Sensitive Data Masking & PII Sanitization

To comply with data privacy regulations (GDPR, CCPA), the logging layer enforces strict data scrubbing rules:
- **Passwords**: Never logged in plain text or hash format. Request body passwords in `/auth/login` and `/auth/register` are excluded from log outputs.
- **JWT Authorization Tokens**: Bearer tokens in headers are stripped of signature payloads before log ingestion.
- **Credit Cards & Financials**: SoundSphere does not process direct payments; no PCI-DSS data is ever persisted or logged.

### 2.3 Exception Tracking Blueprint (Sentry Integration)

For distributed cloud deployments, SoundSphere integrates with Sentry via the official `@sentry/node` package. Below is the drop-in configuration for production monitoring:

```javascript
// Example: server/config/sentry.js
const Sentry = require('@sentry/node');

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2, // Sample 20% of transactions for performance tracing
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      // Strip sensitive headers and parameters
      if (event.request && event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    }
  });
  console.log('🛡️ Sentry telemetry and error tracking initialized.');
}
```

### 2.4 Log Rotation (`logrotate` & PM2)

On standalone Linux VPS/EC2 servers, unconstrained log growth can exhaust disk inodes. SoundSphere employs automatic log rotation via `logrotate`:

```
# /etc/logrotate.d/soundsphere
/var/www/SoundSphere/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}
```

---

## 3. Software Update & CI/CD Deployment Procedures

To maintain high availability and deliver rapid improvements without disrupting active streaming sessions, SoundSphere utilizes continuous integration and automated deployment pipelines.

### 3.1 Automated GitHub Actions CI/CD Pipeline

Every pull request and merge into the `main` branch triggers an automated verification and deployment workflow:

```yaml
# .github/workflows/ci-cd.yml
name: SoundSphere Production CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 22 LTS
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Client & Root Dependencies
        run: npm ci

      - name: Code Quality & Linting
        run: npm run lint

      - name: Production Frontend Bundle Build
        run: npm run build

      - name: Install Backend Dependencies
        run: cd server && npm ci

      - name: Execute Full Automated Test Suite (58 Tests)
        run: npm run test:all
        env:
          JWT_SECRET: ci_pipeline_temporary_jwt_secret_12345
          NODE_ENV: test
          DB_PATH: ':memory:'

  deploy-production:
    needs: validate-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloud PaaS Deployment
        run: |
          echo "🚀 CI passed with 100% test success. Triggering deployment webhook..."
          # curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

### 3.2 Zero-Downtime Deployment Strategies

#### Strategy A: Blue-Green Deployment (Zero-Downtime on AWS / PaaS)
1. **Current Environment (Blue)**: Actively serving live traffic via port 5001.
2. **Staging Environment (Green)**: Deployed to an alternate port (5002) or secondary container instance.
3. **Automated Smoke Tests**: Execute `npm run test:uat` against Green.
4. **Traffic Switch**: Nginx upstream or cloud load balancer points immediately to Green.
5. **Decommission**: Blue instance is gracefully drained and decommissioned.

#### Strategy B: PM2 Cluster Zero-Downtime Reload (VPS)
```bash
# Pull latest validated release
git pull origin main

# Re-compile frontend production assets
npm ci && npm run build

# Install updated backend dependencies
cd server && npm ci --production && cd ..

# Graceful reload (workers reloaded sequentially with 0s dropped connections)
pm2 reload soundsphere-api --update-env
```

---

## 4. Database Maintenance & Disaster Recovery (DR)

SoundSphere utilizes the high-performance `node:sqlite` database engine configured in Write-Ahead Logging (`WAL`) mode. Embedded SQLite databases require dedicated operational care to ensure data integrity and persistence.

### 4.1 Write-Ahead Logging (WAL) & Checkpointing

In WAL mode, writes append to an adjacent `-wal` journal file, allowing concurrent readers without blocking writers. To prevent the WAL file from growing indefinitely, SoundSphere executes passive checkpoints automatically. For heavy write loads, operations can run a manual checkpoint:

```bash
# Force WAL checkpoint and flush pages back to main database file
sqlite3 /var/www/SoundSphere/server/data/soundsphere.db "PRAGMA wal_checkpoint(TRUNCATE);"
```

### 4.2 Automated Daily Backups to Remote Cloud Storage (S3 / GCS)

To protect against catastrophic disk failure or host termination, a cron job executes non-blocking atomic backups every night at 02:00 UTC using the SQLite online backup API:

```bash
#!/usr/bin/env bash
# /usr/local/bin/backup-soundsphere.sh
set -euo pipefail

BACKUP_DIR="/var/backups/soundsphere"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_FILE="/var/www/SoundSphere/server/data/soundsphere.db"
BACKUP_FILE="${BACKUP_DIR}/soundsphere_backup_${TIMESTAMP}.sqlite"

mkdir -p "${BACKUP_DIR}"

# Perform safe, online non-blocking atomic backup
sqlite3 "${DB_FILE}" ".backup '${BACKUP_FILE}'"

# Compress backup file
gzip "${BACKUP_FILE}"

# Sync encrypted archive to Amazon S3 Bucket
aws s3 cp "${BACKUP_FILE}.gz" s3://soundsphere-production-backups/daily/ --sse AES256

# Prune local backups older than 7 days
find "${BACKUP_DIR}" -type f -name "*.gz" -mtime +7 -delete

echo "[$(date)] SoundSphere database backup successfully created and uploaded: ${BACKUP_FILE}.gz"
```

### 4.3 Database Integrity Check & Vacuuming

Over months of track uploads, playlist creations, and listening log aggregation, the database can develop internal fragmentation. Maintainers execute monthly maintenance during low-traffic windows:

```bash
# 1. Verify B-Tree integrity
sqlite3 /var/data/soundsphere.db "PRAGMA integrity_check;"
# Expected output: ok

# 2. Rebuild database file to reclaim unused space and defragment indices
sqlite3 /var/data/soundsphere.db "VACUUM;"
```

### 4.4 Schema Migrations Playbook

When new application versions introduce relational schema modifications (e.g., adding user settings or social follow tables):
1. **Never alter the live database directly without a backup**: Run `sqlite3 soundsphere.db ".backup pre_migration.db"`.
2. **Execute migrations inside a transaction**:
   ```sql
   BEGIN TRANSACTION;
   ALTER TABLE users ADD COLUMN theme_preference TEXT DEFAULT 'dark';
   CREATE INDEX IF NOT EXISTS idx_users_theme ON users(theme_preference);
   COMMIT;
   ```
3. **Verify Application Functionality**: Execute `npm run test:backend` immediately after migration execution.

---

## 5. Incident Management & Escalation Playbook

### 5.1 Incident Severity Classification Matrix

| Severity Level | Definition | Impact | Target Response Time | Resolution Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **Sev-1: Critical Outage** | Core service down; users cannot stream audio or authenticate. | 100% of users affected. | `< 15 Minutes` | Automatic on-call paging; activate rollback playbook. |
| **Sev-2: Major Degradation** | High API latency (> 1s); search or playlist saving failing intermittently. | > 25% of users affected. | `< 1 Hour` | Inspect WAL file contention, high CPU/RAM usage. |
| **Sev-3: Minor Glitch** | Cosmetic rendering bug; non-critical analytics lagging. | Isolated subset of users. | `< 1 Business Day` | Log bug ticket in GitHub Issues for scheduled sprint. |
| **Sev-4: Enhancement** | Feature request, documentation update, or styling tweak. | Zero operational impact. | Next Release Cycle | Review in bi-weekly sprint planning. |

### 5.2 Emergency Rollback Protocol

If a newly deployed release introduces critical regression errors, follow the 4-step emergency rollback protocol:

```bash
# Step 1: Identify previous stable Git commit or Docker tag
git log --oneline -n 5

# Step 2: Rollback application codebase to previous stable release
git checkout <PREVIOUS_STABLE_COMMIT_HASH>

# Step 3: Re-build frontend assets and install dependencies
npm ci && npm run build
cd server && npm ci --production && cd ..

# Step 4: Restart process via PM2 / Docker
pm2 restart soundsphere-api --update-env

# Step 5: Verify health check
curl -f http://localhost:5001/api/v1/health
```

### 5.3 Blameless Post-Mortem Incident Template

Following resolution of any Sev-1 or Sev-2 incident, maintainers complete a blameless post-mortem document within 48 hours to identify structural root causes and prevent recurrence:

```markdown
# INCIDENT POST-MORTEM REPORT: [INCIDENT-ID]

## 1. Incident Summary
- **Date & Time of Incident**: 
- **Duration of Outage**: 
- **Lead Incident Commander**: 
- **Services Affected**: 

## 2. Customer Impact
- Total users experiencing failed requests or audio playback interruptions.

## 3. Root Cause Analysis (5 Whys)
- Why did the outage occur?
- Why did that condition manifest?
- Why was it not caught during automated testing?
- Why did monitoring not alarm earlier?
- Root Cause Identified:

## 4. Timeline of Events (UTC)
- `14:00` - Deployment executed by engineer.
- `14:04` - Automated health check alarm triggered (5xx error rate > 2%).
- `14:07` - Incident Commander triages and initiates rollback protocol.
- `14:12` - Previous stable release restored and verified.
- `14:15` - Health check status returns to "UP".

## 5. Preventative Action Items
| Action Item | Owner | Target Completion Date | Status |
| :--- | :--- | :--- | :--- |
| Add automated UAT test covering edge-case condition | Engineering Team | 2026-10-30 | OPEN |
| Add memory threshold alarm in CloudWatch / BetterStack | DevOps Team | 2026-10-27 | OPEN |
```
