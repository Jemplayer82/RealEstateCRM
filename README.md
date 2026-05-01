# RealEstateCRM

A full-featured Customer Relationship Management system built for real estate professionals. MERN stack (MongoDB, Express, React, Node.js), fully Dockerized, with security hardening, role-based access control, and a built-in property lookup service powered by HomeHarvest.

## What It Does

- **Contact and Lead Management** — track clients, leads, and their lifecycle through your pipeline
- **Property Management** — listings with photos, floor plans, virtual tours, documents, and unit tracking for multi-family properties
- **Task and Calendar** — schedule tasks, meetings, phone calls, and emails tied to contacts and leads
- **Offer Letters** — generate PDF offer letters from templates via Puppeteer
- **Payments** — Stripe integration for processing payments
- **Email** — send emails via Nodemailer (Office 365) with a built-in template editor
- **Role-Based Access** — granular create/view/update/delete permissions per module
- **Custom Fields** — extend leads, contacts, and properties with custom fields and modules
- **Property Lookup** — auto-fill property details from MLS data via an integrated Python service
- **Reporting** — dashboards and analytics

## Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 17 + Chakra UI + Redux Toolkit |
| Backend | Node.js + Express |
| Database | MongoDB 7 |
| Property data | Python + Flask + HomeHarvest |
| PDF generation | Puppeteer (Chromium, server-side) |
| Payments | Stripe |
| Email | Nodemailer |
| Deployment | Docker + Docker Compose |

## Quick Start

```bash
git clone https://github.com/jemplayer82/RealEstateCRM.git
cd RealEstateCRM
docker compose up --build
```

On first run, a setup page will guide you through creating the admin account.

### Services

| Service | Port | Description |
|---------|------|-------------|
| client | 3000 | React frontend served by nginx |
| server | 5001 | Express API |
| python-service | 5002 | Property lookup via HomeHarvest |
| mongo | 27017 | MongoDB |

## Environment Variables

Set these under `server.environment` in `docker-compose.yml` or in a `.env` file:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Random string for signing JWT tokens |
| `DB_URL` | Yes | MongoDB connection string |
| `DB` | Yes | Database name |
| `CORS_ORIGIN` | No | Allowed origin (default: `http://localhost:3000`) |
| `REACT_APP_STRIPE_PUBLIC_KEY` | No | Stripe publishable key |

The admin account is created through the first-run setup page — no hardcoded credentials.

## Useful Commands

```bash
docker compose up -d          # start in background
docker compose down           # stop
docker compose down -v        # stop and wipe database
docker compose logs server    # view server logs
docker compose build          # rebuild after code changes
```

## What Has Been Changed From Upstream

This project started as a fork but has been significantly reworked. The original UI shell is the only thing that remains from the source; everything else — the backend architecture, security model, deployment setup, and data integrations — has been rebuilt.

### Full Dockerization

- `docker-compose.yml` with a 4-service stack (MongoDB, server, client, python-service)
- `server/Dockerfile` — Node 18 slim with Chromium for Puppeteer
- `client/Dockerfile` — multi-stage build (Node build step, nginx to serve)
- `client/nginx.conf` — reverse proxies `/api/` to the server with SPA fallback for React Router
- `.dockerignore` files to keep builds lean

### Python Property Lookup Service

An additional Flask microservice (`python-service/`) uses HomeHarvest to look up MLS property data by address and auto-fill fields when adding a new property in the CRM.

### Security Hardening (30+ fixes)

**Critical:**
- JWT secret moved from hardcoded `'secret_key'` to `process.env.JWT_SECRET`
- Added `auth` middleware to 9 previously unprotected routes (file uploads, payments, documents)
- Removed the open `/admin-register` endpoint that allowed anyone to create superAdmin accounts
- Removed hardcoded default admin credentials
- CORS locked down from `*` to a configured origin

**Server middleware:**
- Added `helmet` for security headers
- Added `express-rate-limit` (100 req / 15 min globally; 10 req / 15 min on login and register)
- Added 1MB body size limit
- Added `express-mongo-sanitize` to prevent NoSQL injection

**File uploads:**
- Centralized Multer configuration with MIME type allowlists and size limits
  - Images: JPEG / PNG / GIF / WebP, 5MB max
  - Documents: images + PDF / Word / Excel, 10MB max
  - Videos: MP4 / WebM / QuickTime, 50MB max
- All `express.static` routes now require authentication

**Input validation:**
- `express-validator` on login and register routes
- Password complexity enforced (min 8 chars, uppercase, lowercase, number)
- EJS templates sanitized with `sanitize-html` before Puppeteer rendering

**Client-side:**
- Auth token added to payment form fetch call (was sending unauthenticated)
- Stripe public key moved to environment variable
- `DOMPurify` added to sanitize `dangerouslySetInnerHTML` in email history view (XSS fix)
- Axios 401 interceptor added — auto-logout on expired or invalid tokens
- `console.error` calls cleaned to avoid leaking sensitive data
