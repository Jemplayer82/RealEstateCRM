# Security Hardening Plan — RealEstateCRM

This is a step-by-step implementation plan. Each phase is independent and can be done as a separate commit. All file paths are relative to the repo root.

---

## PHASE 1: Server-side critical fixes (do first, no frontend changes needed)

### 1A. Move JWT secret to environment variable

**Files to change:**
- `server/middelwares/auth.js` (line 10)
- `server/controllers/user/user.js` (line 210)

**What to do:**
- In both files, replace the hardcoded string `'secret_key'` with `process.env.JWT_SECRET`
- In `server/index.js`, after `require('dotenv').config()` (line 9), add a startup check that crashes if `JWT_SECRET` is missing:
  ```js
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required');
    process.exit(1);
  }
  ```
- Add `JWT_SECRET=<generate-a-64-char-random-string>` to `docker-compose.yml` under `server.environment`
- Create a `server/.env.example` file documenting all required env vars

### 1B. Fix auth middleware — add missing `return` and improve error codes

**File:** `server/middelwares/auth.js`

Replace the entire file with:
```js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Authentication failed. Token missing.' });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Authentication failed. Invalid or expired token.' });
    }
};

module.exports = auth;
```

Key changes: added `return` before the 401 response (currently code falls through to `jwt.verify` even when token is missing), changed catch status from 500 to 401, use env var for secret.

### 1C. Add `auth` middleware to all unprotected routes

**File: `server/controllers/property/_routes.js`** — lines 33-52
Add `auth` before the multer middleware on these 4 routes:
```js
router.post("/add-property-photos/:id", auth, property.upload.array("property", 10), property.propertyPhoto);
router.post("/add-virtual-tours-or-videos/:id", auth, property.virtualTours.array("property", 10), property.VirtualToursorVideos);
router.post("/add-floor-plans/:id", auth, property.FloorPlansStorage.array("property", 10), property.FloorPlans);
router.post("/add-property-documents/:id", auth, property.PropertyDocumentsStorage.array("property", 10), property.PropertyDocuments);
```

**File: `server/controllers/document/_routes.js`** — lines 12-14
Add `auth` to these 3 routes:
```js
router.get('/download/:id', auth, document.downloadFile);
router.post('/link-document/:id', auth, document.LinkDocument);
router.delete('/delete/:id', auth, document.deleteFile);
```

**File: `server/controllers/payment/_routes.js`** — lines 7-8
Add auth import and middleware:
```js
const auth = require('../../middelwares/auth');
router.post('/add', auth, payment.add);
router.get('/', auth, payment.index);
```

**File: `server/controllers/user/_routes.js`** — line 7
Protect admin-register. Either remove it entirely or add auth + superAdmin check:
```js
router.post('/admin-register', auth, requireSuperAdmin, user.adminRegister);
```
If you remove it entirely, the only superAdmin is created by the DB seed in `db/config.js`. That's safer.
**Recommendation:** Delete line 7 entirely. The seed in `db/config.js` already creates the admin.

### 1D. Fix the Bearer token header (missing space)

**File:** `server/controllers/user/user.js` — line 216

Change:
```js
.setHeader("Authorization", `Bearer${token}`)
```
To:
```js
.setHeader("Authorization", `Bearer ${token}`)
```

---

## PHASE 2: Add security middleware to Express

### 2A. Install packages

```bash
cd server && npm install helmet express-rate-limit
```

### 2B. Add helmet and rate limiting to `server/index.js`

After line 5 (`const cors = require('cors');`), add:
```js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
```

After line 15 (`const app = express();`), add — IN THIS ORDER:
```js
// Security headers
app.use(helmet());

// Rate limiting — 100 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Stricter rate limit on auth endpoints — 10 attempts per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later.' }
});
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);
```

### 2C. Lock down CORS

In `server/index.js`, replace line 19:
```js
app.use(cors())
```
With:
```js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```
Add `CORS_ORIGIN: http://localhost:3000` to `docker-compose.yml` under `server.environment`.

### 2D. Add body size limit

In `server/index.js`, replace line 17:
```js
app.use(bodyParser.json());
```
With:
```js
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
```

---

## PHASE 3: File upload hardening

### 3A. Create a shared multer config helper

**Create new file:** `server/middelwares/uploadConfig.js`
```js
const multer = require('multer');
const path = require('path');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5 MB
const MAX_DOC_SIZE = 10 * 1024 * 1024;    // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50 MB

function createFileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Allowed: ${allowedTypes.join(', ')}`), false);
    }
  };
}

function createUpload(destination, { allowedTypes = ALLOWED_DOC_TYPES, maxSize = MAX_DOC_SIZE } = {}) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, destination),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: createFileFilter(allowedTypes),
    limits: { fileSize: maxSize }
  });
}

module.exports = { createUpload, ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES, ALLOWED_VIDEO_TYPES, MAX_IMAGE_SIZE, MAX_DOC_SIZE, MAX_VIDEO_SIZE };
```

### 3B. Update each controller that creates multer instances

In each of these files, replace bare `multer({ storage: ... })` calls with the `createUpload()` helper. The files that need updating are:
- `server/controllers/property/property.js` — find all `multer({` calls (there are ~5: `upload`, `virtualTours`, `FloorPlansStorage`, `PropertyDocumentsStorage`, `offerLetterStorage`). Replace each with `createUpload('uploads/Property/...', { allowedTypes: ..., maxSize: ... })`.
- `server/controllers/images/imagesController.js` — find the `multer({` call. Replace with `createUpload('uploads/images', { allowedTypes: ALLOWED_IMAGE_TYPES, maxSize: MAX_IMAGE_SIZE })`.
- `server/controllers/document/document.js` — find the `multer({` call. Replace with `createUpload('uploads/document')`.

### 3C. Protect static file routes with auth

In these files, add `auth` before `express.static()`:
- `server/controllers/property/_routes.js` lines 54-67 — wrap each `express.static` route:
  ```js
  router.use("/property-documents", auth, express.static("uploads/Property/property-documents"));
  router.use("/offer-letter", auth, express.static("uploads/offer-letter"));
  router.use("/floor-plans", auth, express.static("uploads/Property/floor-plans"));
  router.use("/virtual-tours-or-videos", auth, express.static("uploads/Property/virtual-tours-or-videos"));
  router.use("/property-photos", auth, express.static("uploads/Property/PropertyPhotos"));
  ```
- `server/controllers/images/_routes.js` lines 17-18:
  ```js
  router.use("/authImg", auth, express.static('uploads/images'));
  router.use("/logoImg", auth, express.static('uploads/images'));
  ```
- `server/controllers/document/_routes.js` line 15:
  ```js
  router.use('/images', auth, express.static('uploads/document'));
  ```

---

## PHASE 4: Input validation and sanitization

### 4A. Install `express-validator`

```bash
cd server && npm install express-validator
```

### 4B. Add validation to user routes

**File:** `server/controllers/user/_routes.js`

Add validators to login and register:
```js
const { body } = require('express-validator');
const { handleValidation } = require('../../middelwares/validate');

router.post('/login', [
  body('username').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  handleValidation
], user.login);

router.post('/register', auth, [
  body('username').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('firstName').trim().escape().isLength({ min: 1, max: 50 }),
  body('lastName').trim().escape().isLength({ min: 1, max: 50 }),
  body('phoneNumber').optional().isMobilePhone(),
  handleValidation
], user.register);
```

**NOTE:** Also add `auth` to `/register` — currently any unauthenticated user can create accounts.

### 4C. Create validation middleware helper

**Create new file:** `server/middelwares/validate.js`
```js
const { validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { handleValidation };
```

### 4D. Sanitize the EJS template injection

**File:** `server/controllers/property/property.js` — around line 337

The line `ejs.renderFile(templatePath, { ...req?.body, ... })` passes raw user input into a template engine. Sanitize before rendering:

```js
const sanitizeHtml = require('sanitize-html'); // npm install sanitize-html

// Before ejs.renderFile, sanitize all string values:
const sanitized = {};
for (const [key, value] of Object.entries(req.body)) {
  sanitized[key] = typeof value === 'string' ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }) : value;
}
const html = await ejs.renderFile(templatePath, { ...sanitized, ... });
```

---

## PHASE 5: Harden default admin seed

### 5A. Improve the admin seed in `server/db/config.js`

**File:** `server/db/config.js` — lines 85-99

Replace the hardcoded credentials block with:
```js
let adminExisting = await User.find({ role: 'superAdmin' });
if (adminExisting.length <= 0) {
    const username = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
        console.error('WARNING: No ADMIN_PASSWORD set. Generating random password.');
        const crypto = require('crypto');
        password = crypto.randomBytes(16).toString('hex');
        console.log(`Generated admin password: ${password}`);
        console.log('SAVE THIS PASSWORD. It will not be shown again.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '',
        role: 'superAdmin'
    });
    await user.save();
    console.log("Admin created successfully.");
}
```

Key changes:
- Remove the hardcoded `_id` (was `64d33173fd7ff3fa0924a109`)
- Read credentials from env vars, fall back to random password
- Increase bcrypt rounds from 10 to 12
- Remove hardcoded phone number

Add to `docker-compose.yml` under `server.environment`:
```yaml
ADMIN_EMAIL: admin@gmail.com
ADMIN_PASSWORD: <choose-a-strong-password>
```

---

## PHASE 6: Client-side fixes

### 6A. Add auth header to payment form

**File:** `client/src/views/admin/payments/paymentForm.js` — line 32-36

Change the `fetch` headers to include the auth token:
```js
fetch(`${process?.env?.REACT_APP_BASE_URL}api/payment/add`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": localStorage.getItem("token") || sessionStorage.getItem("token"),
  },
  body: JSON.stringify({ ... }),
})
```

### 6B. Move Stripe public key to env var

**File:** `client/src/views/admin/payments/index.js` — lines 7-8

Replace:
```js
const PUBLIC_KEY = "pk_test_51Nx0ulSFr3y25H3g...";
```
With:
```js
const PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
```

### 6C. Sanitize dangerouslySetInnerHTML usage

```bash
cd client && npm install dompurify --legacy-peer-deps
```

**File:** `client/src/views/admin/emailHistory/View.js` — line 367

Add at top of file:
```js
import DOMPurify from 'dompurify';
```

Change line 367 from:
```jsx
dangerouslySetInnerHTML={{ __html: data?.html }}
```
To:
```jsx
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data?.html || '') }}
```

Also check line 324 — it's inside a comment block so it's not active, but sanitize it too in case someone uncomments it.

### 6D. Add axios interceptor for 401 handling

**File:** `client/src/services/api.js`

Add at the top of the file, after the imports:
```js
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```
This auto-logs out users when their token is expired or invalid.

### 6E. Stop logging sensitive data to console

In `client/src/services/api.js`, replace all `console.error(e)` with:
```js
console.error('API request failed:', e?.response?.status || 'unknown');
```
This avoids dumping full error objects (which may contain tokens or user data) to the browser console in production.

---

## PHASE 7: Docker Compose environment updates

**File:** `docker-compose.yml` — final `server.environment` section should be:

```yaml
server:
  build: ./server
  restart: unless-stopped
  ports:
    - "5001:5001"
  environment:
    DB_URL: mongodb://mongo:27017
    DB: RealEstateCRM
    JWT_SECRET: ${JWT_SECRET}
    CORS_ORIGIN: http://localhost:3000
    ADMIN_EMAIL: admin@gmail.com
    ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    NODE_ENV: production
  depends_on:
    - mongo
```

Create a `.env` file in repo root (add to `.gitignore`):
```
JWT_SECRET=<64-char-random-string>
ADMIN_PASSWORD=<strong-password>
```

---

## Summary — files changed per phase

| Phase | Files modified | Files created | npm packages |
|-------|---------------|--------------|-------------|
| 1 | `server/middelwares/auth.js`, `server/controllers/user/user.js`, `server/controllers/user/_routes.js`, `server/controllers/property/_routes.js`, `server/controllers/document/_routes.js`, `server/controllers/payment/_routes.js`, `server/index.js` | `server/.env.example` | — |
| 2 | `server/index.js` | — | `helmet`, `express-rate-limit` |
| 3 | `server/controllers/property/property.js`, `server/controllers/images/imagesController.js`, `server/controllers/document/document.js`, `server/controllers/property/_routes.js`, `server/controllers/images/_routes.js`, `server/controllers/document/_routes.js` | `server/middelwares/uploadConfig.js` | — |
| 4 | `server/controllers/user/_routes.js`, `server/controllers/property/property.js` | `server/middelwares/validate.js` | `express-validator`, `sanitize-html` |
| 5 | `server/db/config.js`, `docker-compose.yml` | — | — |
| 6 | `client/src/views/admin/payments/paymentForm.js`, `client/src/views/admin/payments/index.js`, `client/src/views/admin/emailHistory/View.js`, `client/src/services/api.js` | — | `dompurify` |
| 7 | `docker-compose.yml` | `.env`, root `.gitignore` update | — |

## Order of operations

Do phases 1 → 2 → 3 → 4 → 5 → 6 → 7. Each phase should be one commit. After each phase, run `docker compose build && docker compose up -d` and verify the app still works (login, CRUD users, upload a file, make a payment). Phase 1 is the most critical — if you only do one thing, do phase 1.
