# FollowUpOS — AI Sales Follow-Up SaaS Platform

> **AI Sales Follow-Up Agent for service businesses that captures leads across channels, understands intent, scores urgency, manages conversations, automatically follows up, and helps sales teams close more deals.**

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Visitors & Prospects
        WF[Website Contact Form]
        WA[WhatsApp Inbound]
        CAL[Calendly Booking]
        META[Meta Lead Ads]
        API_IN[Public REST API]
    end

    subgraph Client Application [React 18 + Vite + TS]
        MARKETING[Landing & Marketing Pages]
        COCKPIT[Daily Execution Cockpit /today]
        COPILOT[AI Sales Copilot /copilot]
        LEADS[Leads & Pipeline CRM]
        INTEG[Integrations & API Key Hub]
        BILLING[Razorpay Subscription Billing]
        ADMIN[Super Admin HQ /admin]
    end

    subgraph Backend API [Node.js + Express 4.19]
        AUTH[JWT Auth & RBAC Guard]
        LEAD_SVC[Lead & Contact Service]
        CADENCE_SVC[Follow-Up Sequence Engine]
        INTEG_SVC[Integration Service + AES-256 GCM]
        BILLING_SVC[Billing & Usage Service]
        SCHEDULER[Cron Cadence Daemon]
        MAILER[Transactional Mailer]
    end

    subgraph External Infrastructure
        MONGO[(MongoDB Atlas Multi-Tenant)]
        OPENAI[OpenAI gpt-4o / gpt-4o-mini]
        RZP[Razorpay Payment Gateway]
        SMTP[SMTP / SendGrid Server]
    end

    WF -->|POST /api/public/forms/submit| Backend API
    WA -->|POST /api/webhooks/whatsapp| Backend API
    CAL -->|POST /api/webhooks/calendly| Backend API
    META -->|POST /api/webhooks/meta| Backend API
    API_IN -->|POST /api/public/leads| Backend API

    Client Application <-->|Authenticated REST API| Backend API

    Backend API <--> MONGO
    Backend API <--> OPENAI
    Backend API <--> RZP
    Backend API <--> SMTP
```

---

## ✨ Production Capabilities

- **Production Authentication & Security**:
  - **Continue with Google**: Real Google OAuth 2.0 / OpenID Connect flow with verified server-side identity and safe account linking.
  - **Email/Password Signup**: Mandatory email verification with single-use SHA-256 hashed tokens and rate-limited resend.
  - **Password Reset**: Cryptographically random hashed reset tokens with session invalidation.
- **Daily Sales Execution Cockpit (`/today`)**: Prioritized daily task feed with one-click follow-up dispatch and hot lead alerts.
- **AI Sales Copilot (`/copilot`)**: Interactive chat assistant that summarizes objection history, suggests personalized outreach, and drafts contextual replies.
- **Multi-Channel Lead Ingestion**:
  - Website Form Embed builder (`POST /api/public/forms/:id/submit`) with honeypot anti-spam protection.
  - Public REST API (`POST /api/public/leads`) with Bearer token authentication (`fup_live_...`).
  - Inbound Webhook endpoint (`POST /api/public/webhooks/leads/:token`) for Zapier, Make, and Typeform.
- **Real Integration Management (`/integrations`)**:
  - Modal-based configuration with real connection verification tests.
  - Client-side secret masking (`sk-••••••••abcd`) and AES-256-GCM encryption at rest.
  - Key rotation, revocation, and recent webhook delivery audit trail.
- **Commercial Billing & Subscriptions (`/billing`)**:
  - Razorpay INR plans: Starter (₹999/mo), Growth (₹2,999/mo), Agency (₹7,999/mo).
  - Real-time usage metering with soft (80%) and hard (100%) limit enforcement.
  - Pluggable provider adapter (`RazorpayBillingProvider` and `MockBillingProvider`).
- **Super Admin Command Center (`/admin`)**:
  - Protected platform role isolation (`super_admin`).
  - Live MRR telemetry, tenant management, subscription lifecycle tracking, support ticket desk, and audit logs.
- **Multi-Tenant Data Isolation**:
  - Strict organizational query scoping preventing IDOR vulnerabilities.
  - Role-Based Access Control (`owner`, `admin`, `manager`, `sales_rep`, `super_admin`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (MongoDB Atlas connection URI or local MongoDB)

### 1. Clone & Setup Backend
```bash
cd server
npm install
cp .env.example .env
npm run create-super-admin
npm run dev
```

### 2. Setup Frontend Client
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

### 3. Run Automated Security & Lifecycle Tests
```bash
cd server
npm test -- src/tests/multiTenantSecurity.test.js
npm test -- src/tests/e2eLifecycle.test.js
```

---

## 📖 Detailed Documentation

- 🖥️ [**Frontend Guide (`client/README.md`)**](file:///c:/Users/Lenovo/Desktop/FollowUpOs/client/README.md)
- ⚙️ [**Backend Architecture & Integration Guide (`server/README.md`)**](file:///c:/Users/Lenovo/Desktop/FollowUpOs/server/README.md)
- 📋 [**Production Deployment Checklist (`PRODUCTION_CHECKLIST.md`)**](file:///c:/Users/Lenovo/Desktop/FollowUpOs/PRODUCTION_CHECKLIST.md)
