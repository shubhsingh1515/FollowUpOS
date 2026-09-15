# FollowUpOS — Final Production Launch Checklist

Use this checklist before opening FollowUpOS to real paying customers and deploying to production.

---

## 🏗️ 1. Infrastructure & Hosting
- [ ] **MongoDB Atlas Cluster**: Provisioned M10+ replica set with automated backups enabled.
- [ ] **Network Access**: IP access list configured with production server CIDR blocks.
- [ ] **Database Indexes**: Compound indexes verified for `organizationId + status`, `organizationId + email`, `organizationId + lastMessageAt`.
- [ ] **Domain & TLS/HTTPS**: Custom production domains configured with SSL/TLS certificates (e.g. `app.followupos.com` and `api.followupos.com`).
- [ ] **Process Manager / Container**: Application deployed using Docker or PM2 with restart-on-failure policies.

---

## 🔐 2. Authentication & Secrets
- [ ] **Google OAuth 2.0 Client**: Google Cloud Project configured with OAuth Consent Screen, verified scopes (`openid`, `email`, `profile`), and production authorized origins/redirect URIs (`https://api.followupos.com/api/auth/google/callback`).
- [ ] **Google Secrets Configured**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` added to production `.env` (Platform Owner level only).
- [ ] **JWT Secrets**: Strong random 64-character hex strings generated for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- [ ] **Encryption Key**: 64-character hex string configured for `ENCRYPTION_KEY` (AES-256-GCM).
- [ ] **Super Admin Account**: Initial platform administrator bootstrapped via `npm run create-super-admin`.
- [ ] **Email Verification Mandatory**: Verified unverified email accounts receive `EMAIL_NOT_VERIFIED` on login attempts and cannot bypass security guards.
- [ ] **Password Reset Tests**: Verified single-use hashed token reset invalidates active refresh sessions.
- [ ] **Demo Mode Disabled**: `DEMO_MODE=false` in production `.env` to enforce real provider credentials.
- [ ] **CORS Configuration**: Restrict `cors.origin` in `server/src/app.js` strictly to the verified frontend domain.

---

## 💳 3. Billing & Razorpay Subscriptions
- [ ] **Razorpay Live Keys**: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` switched from `rzp_test_...` to `rzp_live_...`.
- [ ] **Razorpay Plans**: Monthly and Annual plans created in Razorpay Subscriptions Dashboard:
  - Starter: ₹999/mo (`plan_StarterMonthly_999`)
  - Growth: ₹2,999/mo (`plan_GrowthMonthly_2999`)
  - Agency: ₹7,999/mo (`plan_AgencyMonthly_7999`)
- [ ] **Webhook Configuration**: Live webhook URL registered in Razorpay Dashboard (`https://api.yourdomain.com/api/webhooks/razorpay`) with secret configured in `RAZORPAY_WEBHOOK_SECRET`.
- [ ] **Webhook Events**: Enabled `subscription.activated`, `subscription.charged`, `subscription.halted`, `subscription.cancelled`, `payment.failed`.

---

## 🧠 4. AI Engine & Token Limits
- [ ] **OpenAI Production Key**: Valid `OPENAI_API_KEY` set with tier 2+ rate limits.
- [ ] **Usage Quota Alerts**: Hard limits configured in OpenAI account settings to prevent unexpected charges.
- [ ] **Model Selection**: Default model set to `gpt-4o-mini` for fast qualification with `gpt-4o` for deep deal strategies.

---

## 📧 5. Transactional Email
- [ ] **Email Provider**: `EMAIL_PROVIDER` set to `smtp`, `sendgrid`, or `resend`.
- [ ] **DNS Records**: SPF, DKIM, and DMARC TXT records verified on the sending domain (`followupos.com`).
- [ ] **Sender Address**: `EMAIL_FROM` set to `FollowUpOS <notifications@followupos.com>`.

---

## 🔌 6. Integrations & Channels
- [ ] **WhatsApp Business Cloud API**: Meta app approved with `whatsapp_business_messaging` permissions.
- [ ] **Meta Lead Ads**: App review completed for `leads_retrieval` and `pages_show_list` scopes.
- [ ] **Inbound Webhooks**: Public lead webhook endpoint tested with sample payloads.
- [ ] **Embed Widget**: Test lead submitted from an external test HTML page.

---

## 🛡️ 7. Security & Tenant Isolation
- [ ] **Multi-Tenant Test Suite**: Verified passing:
  ```bash
  cd server && npm test -- src/tests/multiTenantSecurity.test.js
  ```
- [ ] **Lifecycle Test Suite**: Verified passing:
  ```bash
  cd server && npm test -- src/tests/e2eLifecycle.test.js
  ```
- [ ] **Frontend Build**: Verified 0 TypeScript / bundling errors:
  ```bash
  cd client && npm run build
  ```
- [ ] **Rate Limiting**: Rate limiters verified on public routes (`/api/auth/*`, `/api/public/leads`, `/api/public/forms/*`).
- [ ] **Log Redaction**: Checked server logs to ensure no passwords, plaintext tokens, or credit card numbers are written to logs.
