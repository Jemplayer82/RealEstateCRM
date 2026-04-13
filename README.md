# RealEstateCRM

A full-featured Customer Relationship Management system built for Real Estate professionals. MERN stack (MongoDB, Express, React, Node.js), fully Dockerized, with security hardening and an interactive first-run setup.

## What it does

- **Contact & Lead Management** -- track clients, leads, and their lifecycle through your pipeline
- **Property Management** -- listings with photos, floor plans, virtual tours, documents, and unit tracking for apartments
- **Task & Calendar** -- schedule tasks, meetings, phone calls, and emails tied to contacts/leads
- **Offer Letters** -- generate PDF offer letters from templates via Puppeteer
- **Payments** -- Stripe integration for processing payments
- **Email** -- send emails via nodemailer (Office 365) with template editor
- **Role-Based Access** -- create roles with granular create/view/update/delete permissions per module
- **Custom Fields** -- extend Leads, Contacts, and Properties with custom fields and modules
- **Reporting** -- dashboards and analytics

## Quick start (Docker)

```bash
git clone https://github.com/Jemplayer82/RealEstateCRM.git
cd RealEstateCRM
docker compose up --build
```

On first run you'll see the setup page to create your admin account.

### Services

| Service | Port | Description |
|---------|------|-------------|
| client  | 3000 | React frontend served by nginx |
| server  | 5001 | Express API |
| mongo   | 27017 | MongoDB 7 |

### Environment variables

Set these in `docker-compose.yml` under `server.environment` or in a `.env` file:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Random string for signing JWT tokens |
| `DB_URL` | Yes | MongoDB connection string |
| `DB` | Yes | Database name |
| `CORS_ORIGIN` | No | Allowed origin (default: `http://localhost:3000`) |
| `ADMIN_EMAIL` | No | Initial admin email (set via setup page) |
| `ADMIN_PASSWORD` | No | Initial admin password (set via setup page) |
| `REACT_APP_STRIPE_PUBLIC_KEY` | No | Stripe publishable key |

### Useful commands

```bash
docker compose up -d          # start in background
docker compose down            # stop
docker compose down -v         # stop and wipe database
docker compose logs server     # view server logs
docker compose build           # rebuild after code changes
```

## What has been changed (from upstream)

### Dockerization
- Added `docker-compose.yml` with 3-service stack (mongo, server, client)
- `server/Dockerfile` -- Node 18 slim with Chromium for Puppeteer
- `client/Dockerfile` -- multi-stage build (Node build step, nginx to serve)
- `client/nginx.conf` -- reverse proxy `/api/` to server, SPA fallback for React Router
- `.dockerignore` files to keep builds fast

### Security hardening (30+ fixes)

**Critical fixes:**
- JWT secret moved from hardcoded `'secret_key'` to `process.env.JWT_SECRET`
- Added `auth` middleware to 9 previously unprotected routes (file uploads, payments, documents)
- Removed open `/admin-register` endpoint (anyone could create superAdmin accounts)
- Removed hardcoded default admin credentials (`admin@gmail.com` / `admin123`)
- Locked down CORS from `*` to configured origin

**Server middleware:**
- Added `helmet` for security headers
- Added `express-rate-limit` (100 req/15min global, 10/15min on login/register)
- Added body size limit (1MB)

**File uploads:**
- Centralized multer config (`middelwares/uploadConfig.js`) with MIME type allowlists and file size limits
- Images: JPEG/PNG/GIF/WebP only, 5MB max
- Documents: images + PDF/Word/Excel, 10MB max
- Videos: MP4/WebM/QuickTime, 50MB max
- All `express.static` routes now require authentication

**Input validation:**
- Added `express-validator` on login and register routes
- Password complexity enforced (min 8 chars, uppercase, lowercase, number)
- EJS template injection sanitized with `sanitize-html` before Puppeteer rendering

**Client-side:**
- Added auth token to payment form `fetch` call (was sending payments unauthenticated)
- Moved hardcoded Stripe public key to environment variable
- Added `DOMPurify` to sanitize `dangerouslySetInnerHTML` in email history view (XSS fix)
- Added axios 401 interceptor -- auto-logout on expired/invalid tokens
- Cleaned `console.error` calls to avoid leaking sensitive data

**Auth middleware fixes:**
- Added missing `return` before 401 response (was falling through to `jwt.verify` on missing token)
- Changed catch status from 500 to 401
- Fixed `Bearer${token}` to `Bearer ${token}` (missing space)
- Increased bcrypt rounds from 10 to 12

### First-run admin setup
- New `/setup` page shown on first visit when no admin account exists
- `GET /api/user/setup-status` -- public endpoint, returns `{ setupComplete: bool }`
- `POST /api/user/complete-setup` -- creates initial superAdmin, locked after first use (returns 403)
- Removed auto-seed of hardcoded admin from `db/config.js`

### Bug fixes
- **User delete broken** -- `process.env.DEFAULT_USERS.includes()` crashed on undefined; fixed with null check
- **User delete error message** -- referenced undefined `username` variable; fixed to `user?.username`
- **Email editing disabled** -- user edit modal had email field hardcoded to `disabled` in edit mode; removed restriction
- **Role access permissions** -- create and view checkboxes were coupled (checking one auto-checked the other); made them independent. Update/delete still require view.

### New files
- `docker-compose.yml`
- `server/Dockerfile`, `server/.dockerignore`
- `client/Dockerfile`, `client/.dockerignore`, `client/nginx.conf`
- `server/middelwares/uploadConfig.js` -- shared multer config with validation
- `server/middelwares/validate.js` -- express-validator helper
- `client/src/views/auth/setup/index.jsx` -- first-run setup page
- `SECURITY_PLAN.md` -- detailed security audit and remediation plan

## Original project

Forked from [prolinkinfo/RealEstateCRM](https://github.com/prolinkinfo/RealEstateCRM).

## License

MIT
