# FollowUpOS — Admin Manual

> For Super Admins and Support Admins managing the FollowUpOS platform

---

## Table of Contents

1. [Accessing the Admin Panel](#accessing-the-admin-panel)
2. [Platform Command Center (Dashboard)](#platform-command-center-dashboard)
3. [Organization Management](#organization-management)
4. [Subscription Management](#subscription-management)
5. [Support Tickets](#support-tickets)
6. [Audit Logs](#audit-logs)
7. [System Health](#system-health)
8. [Feature Flags](#feature-flags)
9. [Usage Metrics](#usage-metrics)
10. [Impersonation (Support Mode)](#impersonation-support-mode)
11. [Bootstrapping the First Super Admin](#bootstrapping-the-first-super-admin)

---

## 1. Accessing the Admin Panel

The admin panel is located at `/admin` and requires **Super Admin** or **Support Admin** platform credentials.

> **Important**: Regular organization owners/managers cannot access `/admin`. Admin credentials are separate from organization accounts and must be bootstrapped via the CLI.

### Admin Roles

| Role | Access |
|------|--------|
| `super_admin` | Full access — can manage orgs, subscriptions, impersonate, change plans |
| `support_admin` | Read access + support ticket responses; cannot change billing |

---

## 2. Platform Command Center (Dashboard)

The admin dashboard shows real-time metrics from MongoDB:

| Metric | Source |
|--------|--------|
| **MRR** | Sum of all active `Subscription.amount` fields |
| **ARR** | MRR × 12 |
| **Active Paying Workspaces** | Count of subscriptions with `status = 'active'` |
| **Active Trials** | Count of subscriptions with `status = 'trialing'` |
| **Total Leads Ingested** | Count of all Lead documents |
| **AI Analyses This Month** | Sum of UsageEvent quantities for type `AI_ANALYSIS` in current month |

### Plan Tier Breakdown

The plan distribution card shows a real aggregation of subscriptions grouped by plan from MongoDB. This is **not hardcoded** — it reflects exactly what's in your `Subscription` collection.

### System Status

The operational status card shows:
- **Database**: Connected or degraded
- **AI Provider**: Configured (OpenAI key present) or mock_mode
- **Billing**: Configured (real Razorpay key) or mock_mode
- **Email**: Configured (SMTP credentials present) or not_configured
- **Webhooks**: Count of processed webhooks today + failed count

---

## 3. Organization Management

### Viewing All Organizations

Go to **Admin → Organizations** to see all registered organizations with:
- Owner name and email
- Plan and subscription status
- Lead count and user count
- Sign-up date

Use the search box to find by organization name.

### Organization Detail

Click any organization to see:
- All team members (with roles)
- Current subscription details
- Recent leads (last 5)
- Support tickets
- Full contact history

### Admin Actions on Organizations

From the organization detail page, you can:

| Action | Effect |
|--------|--------|
| **Suspend** | Sets `subscriptionStatus = 'suspended'`; users lose access |
| **Reactivate** | Restores access after suspension |
| **Change Plan** | Immediately moves org to a different tier |
| **Extend Trial** | Extends trial period by N days |

All actions are logged in the Audit Log.

---

## 4. Subscription Management

Go to **Admin → Subscriptions** to see all subscriptions across all organizations.

### Subscription Statuses

| Status | Meaning |
|--------|---------|
| `trialing` | In 7-day free trial |
| `active` | Paying subscription |
| `past_due` | Payment failed; grace period active |
| `cancelled` | Scheduled for cancellation at period end |
| `suspended` | Admin-forced suspension |

### Manually Changing a Plan

1. Find the organization in the Organizations list
2. Click their row → **Actions → Change Plan**
3. Select the new plan
4. Provide a reason (required for audit log)
5. Click **Confirm**

This calls `billingService.changePlan()` which updates the Subscription record and syncs with Razorpay if configured.

---

## 5. Support Tickets

Customers can create support tickets from within FollowUpOS. Admins can respond and update status.

### Ticket Statuses

- `open` → New ticket, unassigned
- `in_progress` → Admin is working on it
- `resolved` → Issue closed
- `closed` → Archived

### Responding to a Ticket

1. Go to **Admin → Support**
2. Click a ticket to open it
3. Type your reply in the **Admin Reply** field
4. Optionally update the status
5. Click **Send & Update**

All replies are stored in `SupportTicket.responses` with `senderType: 'admin'`.

---

## 6. Audit Logs

**Admin → Audit Logs** shows the last 100 admin actions.

### Logged Events

| Event | Trigger |
|-------|---------|
| `ORGANIZATION_SUSPEND` | Admin suspended an org |
| `ORGANIZATION_REACTIVATE` | Admin reactivated an org |
| `PLAN_CHANGE_MANUAL` | Admin changed a plan |
| `TRIAL_EXTENSION` | Admin extended a trial |
| `IMPERSONATION_START` | Admin impersonated a user |
| `SUPPORT_TICKET_REPLY` | Admin replied to a ticket |

Audit logs include: admin email, target organization, timestamp, and action details.

---

## 7. System Health

**Admin → System Health** shows the live status of all platform services.

### Status Values

| Status | Meaning |
|--------|---------|
| `healthy` / `configured` | Service is correctly set up and running |
| `mock_mode` | Using mock provider (e.g., OpenAI key not set) |
| `not_configured` | Service not set up (e.g., no SMTP credentials) |
| `degraded` | Service is unhealthy (e.g., MongoDB disconnected, webhook failures) |

### Webhook Monitoring

The health page shows:
- **processedToday**: Real count of WebhookEvent records created today
- **failedToday**: Count of failed webhook events

If `failedToday > 0`, the status changes to `degraded`. Investigate failed webhooks in the `WebhookEvent` MongoDB collection.

---

## 8. Feature Flags

**Admin → Feature Flags** allows toggling features per-organization or globally.

Feature flags are stored in the `FeatureFlag` MongoDB collection and checked at runtime. Common flags:

| Flag | Effect |
|------|--------|
| `AI_COPILOT` | Enable/disable AI Copilot for an org |
| `WHATSAPP_INTEGRATION` | Toggle WhatsApp channel access |
| `AUTOMATION_BUILDER` | Enable/disable automation builder |
| `WHITE_LABEL` | Toggle white-label features |

Changes take effect on the next page load for the affected organization.

---

## 9. Usage Metrics

**Admin → Usage** shows per-organization consumption for the current billing period.

### Tracked Events

Usage is tracked via `UsageEvent` records created when:
- A new lead is created (`LEAD_CREATED`)
- An AI analysis is run (`AI_ANALYSIS`)
- An AI message is generated (`AI_MESSAGE`)

### Billing Enforcement

When an organization exceeds their plan limit, the API returns `429 Usage Limit Exceeded`. The organization must upgrade to continue using the feature.

---

## 10. Impersonation (Support Mode)

Super Admins can impersonate any organization user for debugging purposes.

### How It Works

1. Go to **Admin → Organizations** → find the user
2. Click the user's row → **Impersonate User**
3. Provide a reason (stored in audit log)
4. Copy the temporary access token provided

### Security

- Impersonation is **always logged** in the Audit Log (`IMPERSONATION_START`)
- The impersonation token is a standard JWT with the target user's ID
- It expires in 15 minutes (same as normal access tokens)
- The target user is **not notified** of the impersonation session

---

## 11. Bootstrapping the First Super Admin

### Via API (Recommended)

```bash
curl -X POST https://api.yourdomain.com/api/auth/bootstrap-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-SUPER_ADMIN_BOOTSTRAP_SECRET-from-env",
    "name": "Platform Admin",
    "email": "admin@yourdomain.com",
    "password": "SecurePassword@2026!"
  }'
```

### Via CLI Script

```bash
cd server
npm run create-super-admin
```

This uses `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` from `.env`.

### Post-Bootstrap

1. Log in at `/admin/login` with the super admin credentials
2. Immediately change the default password in Settings
3. Rotate `SUPER_ADMIN_BOOTSTRAP_SECRET` in `.env` (set it to a new random value to prevent re-use)

---

*For system setup, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).*
*For integration configuration, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md).*
