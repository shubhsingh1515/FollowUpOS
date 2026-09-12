# FollowUpOS Backend API Server

High-performance, multi-tenant Node.js + Express backend powering **FollowUpOS** — the AI Sales Follow-Up SaaS platform.

---

## 🏗️ Architecture & Core Components

- **Runtime**: Node.js v18+ (ES Modules `"type": "module"`)
- **Web Framework**: Express 4.19 with `helmet`, `cors`, `compression`, `express-rate-limit`, `cookie-parser`
- **Database & ODM**: MongoDB with Mongoose (compound indexes, tenant isolation)
- **Authentication**: Dual-token JWT (15-minute Access Token, 7-day HttpOnly Refresh Token) + Bcrypt (cost factor 12)
- **Token Encryption**: AES-256-GCM encryption at rest for customer third-party integration tokens
- **Billing Provider**: Pluggable adapter architecture with `RazorpayBillingProvider` (INR) and `MockBillingProvider` (local dev)
- **AI Engine**: Pluggable provider system supporting OpenAI (`gpt-4o-mini`, `gpt-4o`) and mock AI fallback
- **Automated Scheduler**: `node-cron` daemon managing 24h follow-up cadences, stale lead detection, and SLA alerts
- **Testing**: Jest with `--experimental-vm-modules` and Supertest

---

## 📁 Directory Structure

```text
server/
├── src/
│   ├── ai/                 # AI provider adapters (OpenAIProvider, MockAIProvider)
│   ├── billing/            # BillingService, Plans, Razorpay & Mock providers, UsageService
│   ├── config/             # database.js, config.js (startup validation)
│   ├── controllers/        # Route controllers (auth, billing, admin, leads)
│   ├── middleware/         # auth.js (JWT, RBAC), errorHandler.js
│   ├── models/             # Mongoose schemas (User, Organization, Lead, Contact, Integration, Subscription...)
│   ├── routes/             # REST endpoints (auth, leads, integrations, webhooks, billing, admin, public)
│   ├── scripts/            # CLI utilities (createSuperAdmin.js, seed.js)
│   ├── services/           # Business logic (LeadService, FollowUpService, IntegrationService, AuthService)
│   ├── tests/              # Automated integration tests (e2eLifecycle, multiTenantSecurity)
│   ├── utils/              # encryption.js (AES-256-GCM), mailer.js, logger.js (Winston)
│   ├── app.js              # Express application configuration and middleware assembly
│   └── server.js           # Server entrypoint and graceful shutdown listeners
├── .env.example            # Environment configuration template
└── package.json            # Scripts and dependencies
```

---

## 🚀 Quickstart & Setup

### 1. Installation
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `ENCRYPTION_KEY` are populated.

### 3. Bootstrap Super Admin Account
Run the CLI bootstrap utility to create the initial platform Super Admin:
```bash
npm run create-super-admin
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Run Automated Tests
```bash
npm test
```
To run specific test suites:
```bash
npm test -- src/tests/multiTenantSecurity.test.js
npm test -- src/tests/e2eLifecycle.test.js
```

---

## 🔑 Platform Secrets vs Customer Secrets

### 1. Platform / Owner Secrets (`.env`)
These belong to the SaaS operator and must **never** be exposed in client code:
- `MONGODB_URI`: MongoDB connection string.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Cryptographic keys used to sign authentication tokens.
- `ENCRYPTION_KEY`: 64-character hex key used for AES-256-GCM encryption of customer tokens at rest.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`: Master platform merchant keys.
- `OPENAI_API_KEY`: Platform OpenAI key for default AI inferences.
- `SMTP_*`: Transactional mailer credentials for welcome and alert emails.

### 2. Customer / Workspace Secrets (Encrypted at Rest in MongoDB)
These are credentials provided by individual paying organizations for their own channels:
- WhatsApp Business Cloud API Access Tokens & Phone Number IDs.
- Customer SMTP Mailbox Passwords.
- Calendly Personal Access Tokens.
- Customer Meta Lead Ads Page Access Tokens.
- Customer OpenAI BYOK Keys.

All customer secrets are encrypted via AES-256-GCM before database writes and are masked (`sk-••••••••abcd`) whenever returned to the frontend.

---

## 📊 Integration Matrix

| Integration | Auth Type | Required Customer Credentials | Platform / Owner Requirement | Webhook Supported | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WhatsApp Business API** | Bearer Token | Phone Number ID, Business Account ID, Permanent Access Token | Meta App registration | Yes (`/api/webhooks/whatsapp`) | Graph API lookup / token format validation |
| **SMTP / Custom Email** | Credentials | SMTP Host, Port, Username, Password, From Email | None (Customer uses own mailbox) | No | Live `nodemailer.verify()` connection test |
| **Calendly & Cal.com** | Personal Token | Personal Access Token, Webhook Signing Key | None | Yes (`/api/webhooks/calendly`) | Live `/users/me` API profile call |
| **Meta Lead Ads** | Token / App | Meta App ID, Page Access Token (`leads_retrieval`), Page ID | Meta Developer App | Yes (`/api/webhooks/meta`) | Token permissions audit |
| **OpenAI (BYOK)** | API Key | OpenAI API Key (`sk-...`), Optional Model ID | None | No | Models list API test |
| **Inbound Webhook** | Shared Secret | None (System generates unique URL + Token) | Inbound Webhook endpoint | Yes (`/api/public/webhooks/leads/:token`) | Secret token validation |
| **Public REST API** | Bearer Key | Generated Organization Key (`fup_live_...`) | API Rate limiter | No | `settings.apiKey` lookup & tenant binding |
| **Razorpay Subscriptions**| Platform | None (Customer pays via Razorpay modal) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, Webhook Secret | Yes (`/api/webhooks/razorpay`) | HMAC-SHA256 signature verification |

---

## 🔌 Public REST API Documentation

### Ingest Inbound Lead
Submit an inbound lead from any backend, frontend form, or mobile application:

- **Endpoint**: `POST /api/public/leads`
- **Headers**:
  - `Authorization: Bearer fup_live_YOUR_API_KEY`
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Vikram Malhotra",
  "email": "vikram@malhotracapital.com",
  "phone": "+91 98765 12345",
  "company": "Malhotra Capital Partners",
  "service": "Lead Gen & CRM Strategy",
  "budget": "₹3L - ₹10L",
  "message": "Looking to automate our advisory follow-up for 20 reps immediately.",
  "source": "api"
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Lead created and queued for AI analysis",
  "data": {
    "leadId": "660000000000000000000010",
    "contactId": "660000000000000000000011",
    "status": "queued"
  }
}
```

---

## 🔒 Security & Rotation Guides

### 1. Rotating the Public API Key
- Navigate to `/integrations` > **Developer API** tab > click **Rotate Key**.
- A new `fup_live_...` key will be generated and displayed **once**.
- Inbound requests using the previous key will receive `401 Unauthorized`.

### 2. Rotating Platform Encryption Key (`ENCRYPTION_KEY`)
- If the master `ENCRYPTION_KEY` in `.env` is rotated, a decryption migration script must be executed to re-encrypt stored customer tokens with the new key.
- Generate a 64-character random hex string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
