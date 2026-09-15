# FollowUpOS Frontend Client

Enterprise-grade B2B SaaS frontend for **FollowUpOS** — the AI Sales Follow-Up Platform for high-ticket service agencies and B2B consultancies.

---

## 🛠️ Technology Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript (`tsc --noEmit`)
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **State Management**: TanStack React Query (server state cache), Zustand (auth state)
- **Routing**: React Router DOM (v6) with protected workspace guards & Super Admin layout
- **Animations**: GSAP (GreenSock Animation Platform) for high-impact landing page sequences

---

## 📁 Folder Structure

```text
client/
├── public/                # Static favicon, icons, and meta assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── onboarding/    # 10-step interactive setup wizard
│   │   ├── ui/            # Button, Card, Badge, Input primitives
│   │   └── ...
│   ├── layouts/           # AppLayout (sidebar, cockpit navigation)
│   ├── lib/               # Axios API client, utils, cn helper
│   ├── pages/             # View components & routed screens
│   │   ├── admin/         # Super Admin Command Center views
│   │   ├── marketing/     # Services, How it Works, Pricing, Legal
│   │   ├── IntegrationsPage.tsx # Channel Hub & Developer API keys
│   │   ├── BillingPage.tsx      # Razorpay subscriptions & usage meters
│   │   ├── TodayPage.tsx        # Daily Sales Execution Cockpit
│   │   ├── CopilotPage.tsx      # Interactive AI Follow-Up Assistant
│   │   └── ...
│   ├── store/             # Zustand auth & workspace state
│   ├── App.tsx            # Main route definition tree
│   ├── main.tsx           # React DOM root mounting
│   └── index.css          # Design system CSS tokens & utilities
├── index.html             # HTML5 template with SEO meta tags
├── package.json           # Scripts and dependencies
├── tsconfig.json          # Strict TypeScript configuration
└── vite.config.ts         # Vite bundler configuration
```

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Required | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Yes | Backend REST API endpoint | `http://localhost:5000/api` |
| `VITE_APP_URL` | Yes | Frontend application root URL | `http://localhost:5173` |
| `VITE_DEMO_MODE` | Optional | Set to `true` to enable demo mock data | `true` |

> ⚠️ **CRITICAL SECURITY RULE**: Never store private API keys, database connection strings, JWT secrets, or payment credentials in `VITE_*` environment variables. Anything with the `VITE_` prefix is bundled into client-side JavaScript.

### 3. Start Development Server
```bash
npm run dev
```
Development server will be live at `http://localhost:5173` (or `http://localhost:5174` if 5173 is occupied).

### 4. Build for Production
```bash
npm run build
```
Generates minified static assets in `client/dist/`.

---

## 👥 Frontend User Roles & Navigation Guard

| Role | Accessible Pages | Permissions |
| :--- | :--- | :--- |
| **Visitor** | `/`, `/services`, `/how-it-works`, `/pricing`, `/integrations-showcase`, `/privacy`, `/terms`, `/support`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password` | Explore marketing, view plans, register workspace, verify email, reset password. |
| **Workspace Owner** | All app routes (`/today`, `/leads`, `/pipeline`, `/copilot`, `/automations`, `/integrations`, `/billing`, `/team`, `/settings`) | Full control: upgrade/cancel billing, rotate API keys, configure team. |
| **Workspace Admin** | All app routes except subscription billing cancellation. | Manage integrations, configure sequences, manage leads. |
| **Sales Rep** | `/today`, `/leads`, `/contacts`, `/pipeline`, `/copilot`, `/inbox` | Execute daily outreach, edit assigned leads, send AI messages. Restricted from billing & API key rotation. |
| **Super Admin** | `/admin/*` (Overview, Organizations, Subscriptions, Usage, Support, Feature Flags, System Health, Audit Logs) | Platform-level management, tenant suspension, health monitoring. |

---

## 🔐 Customer Authentication Journey

1. **Sign Up (`/register`)**:
   - Option A: **Continue with Google** (instant Google OAuth 2.0 verification, auto-verified email, direct routing to `/onboarding`).
   - Option B: **Email + Password** (creates tenant workspace with `isEmailVerified: false`, triggers secure token email, routes to `/verify-email`).
2. **Email Verification (`/verify-email`)**:
   - Screen displays masked email address (`a••••@company.com`).
   - Resend verification button with **60-second cooldown timer**.
   - Change unverified email form.
   - Email link (`/verify-email?token=...&email=...`) auto-validates with backend, verifies account, and unlocks the workspace.
3. **Sign In (`/login`)**:
   - Supports Google Sign-In and Work Email/Password with show/hide password toggle.
   - If credentials are valid but email is unverified, gracefully redirects to `/verify-email`.
4. **Password Reset (`/forgot-password` & `/reset-password`)**:
   - Request reset link with anti-enumeration protection.
   - Reset password form with token validation, matching passwords, and session revocation.

