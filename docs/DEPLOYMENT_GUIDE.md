# FollowUpOS — Deployment Guide

> For operators deploying FollowUpOS on a server or cloud platform

---

## Table of Contents

1. [Requirements](#requirements)
2. [Environment Variables](#environment-variables)
3. [MongoDB Setup](#mongodb-setup)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Render.com Deployment](#rendercom-deployment)
7. [First-Time Bootstrap](#first-time-bootstrap)
8. [Security Checklist](#security-checklist)

---

## 1. Requirements

| Requirement | Version |
|------------|---------|
| Node.js | 18+ |
| npm | 9+ |
| MongoDB | 6.0+ (Atlas recommended) |
| (Optional) Redis | 7.0+ for queue workers |

---

## 2. Environment Variables

All secrets are configured in `server/.env`. **Never commit this file.**

### Critical (Required for Production)

```env
NODE_ENV=production
PORT=5000
APP_URL=https://api.yourdomain.com
CLIENT_URL=https://app.yourdomain.com

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/followupos?retryWrites=true&w=majority

# JWT (Generate 64-char random strings)
JWT_ACCESS_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<64-char-random>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Encryption (64-char hex string for AES-256-GCM)
ENCRYPTION_KEY=<64-char-hex>

# Demo Mode — MUST be false in production
DEMO_MODE=false
```

### AI Provider

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

If `OPENAI_API_KEY` is blank, the MockAIProvider is used — it still uses your real lead data but generates heuristic-based scores and responses.

### Billing (Razorpay)

```env
BILLING_PROVIDER=razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Create these plan IDs in Razorpay Dashboard > Subscriptions
RAZORPAY_PLAN_STARTER_MONTHLY=plan_...
RAZORPAY_PLAN_GROWTH_MONTHLY=plan_...
RAZORPAY_PLAN_AGENCY_MONTHLY=plan_...
```

### Email (SMTP)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@email.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Super Admin Bootstrap

```env
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=ChangeThisNow@2026!
SUPER_ADMIN_BOOTSTRAP_SECRET=<random-secret>
```

---

## 3. MongoDB Setup

### MongoDB Atlas (Recommended)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with `readWrite` permissions on `followupos`
3. Whitelist your server IP (or `0.0.0.0/0` for dynamic IPs)
4. Copy the connection string to `MONGODB_URI`

### Required Indexes (Auto-created by Mongoose)

Mongoose creates indexes automatically on startup. Key indexes:
- `Lead`: `organizationId`, `status`, `leadTemperature`, `leadScore`
- `Conversation`: `leadId`, `organizationId`
- `FollowUpTask`: `organizationId`, `scheduledAt`, `status`
- `AIAnalysis`: `leadId`, `createdAt`

---

## 4. Local Development

```bash
# Clone repository
git clone <repo-url>
cd FollowUpOs

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Copy and configure environment
cp server/.env.example server/.env
# Edit server/.env with your values

# Run both concurrently
cd .. && npm run dev
# OR separately:
cd server && npm run dev  # port 5000
cd client && npm run dev  # port 5173
```

### Bootstrap Super Admin (first time only)

```bash
cd server
npm run create-super-admin
```

This reads `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` from `.env`.

---

## 5. Production Deployment

### Build the Client

```bash
cd client
npm run build
# Output in client/dist/
```

Serve `client/dist/` via a static host (Netlify, Vercel, Nginx, or Render Static Site).

### Start the Server

```bash
cd server
NODE_ENV=production node src/index.js
# OR with PM2:
pm2 start src/index.js --name followupos-api --env production
```

---

## 6. Render.com Deployment

### Backend (Web Service)

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/index.js` |
| **Environment** | Add all variables from `server/.env` |
| **Health Check Path** | `/api/health` |

### Frontend (Static Site)

| Setting | Value |
|---------|-------|
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Redirect/Rewrite** | Source: `/*` → Destination: `/index.html` (SPA routing) |

### Environment Variable: `VITE_API_URL`

Set in the frontend static site:

```
VITE_API_URL=https://your-api.onrender.com/api
```

---

## 7. First-Time Bootstrap

After deploying the server for the first time:

1. **Ensure MongoDB is connected** — check `/api/health`
2. **Create Super Admin**:
   ```bash
   curl -X POST https://api.yourdomain.com/api/auth/bootstrap-super-admin \
     -H "Content-Type: application/json" \
     -d '{"secret": "<SUPER_ADMIN_BOOTSTRAP_SECRET>", "email": "admin@yourdomain.com", "password": "..."}'
   ```
3. **Log in** to the admin panel at `/admin` with the super admin credentials
4. **Verify system health** at Admin → System Health

---

## 8. Security Checklist

Before going live, verify:

- [ ] `DEMO_MODE=false` in production `.env`
- [ ] `JWT_ACCESS_SECRET` is a random 64-character string (not the default)
- [ ] `JWT_REFRESH_SECRET` is a different random 64-character string
- [ ] `ENCRYPTION_KEY` is a 64-char hex string (used for OAuth token encryption)
- [ ] `SUPER_ADMIN_BOOTSTRAP_SECRET` changed from default
- [ ] MongoDB user has minimum required permissions (not root)
- [ ] MongoDB Atlas network access is restricted to your server IPs
- [ ] HTTPS is enforced on all public endpoints
- [ ] `RAZORPAY_WEBHOOK_SECRET` is set and webhook signature is verified (already implemented)
- [ ] CORS `CLIENT_URL` points to your exact frontend domain (not `*`)
- [ ] Rate limiting is active (already implemented via `express-rate-limit`)

---

*See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for channel-specific configuration.*
