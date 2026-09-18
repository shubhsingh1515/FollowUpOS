# FollowUpOS — User Manual

> Version 2.0 | For sales teams, consultants, and service businesses

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Your Dashboard](#your-dashboard)
3. [Today Workspace](#today-workspace)
4. [Managing Leads](#managing-leads)
5. [Conversations & Messaging](#conversations--messaging)
6. [AI Copilot](#ai-copilot)
7. [Pipeline View](#pipeline-view)
8. [Analytics](#analytics)
9. [Follow-ups & Automations](#follow-ups--automations)
10. [Contacts](#contacts)
11. [Billing & Plan Management](#billing--plan-management)
12. [Settings](#settings)

---

## 1. Getting Started

### Sign Up & Onboarding

1. Visit your FollowUpOS URL and click **Get Started**.
2. Enter your name, business email, and password.
3. Choose your business type and number of leads per month.
4. During the 7-day free trial (Growth plan features), connect at least one lead source.

### Logging In

- Visit your FollowUpOS URL and enter your email + password.
- On subsequent visits, your session is preserved for 7 days.
- To log in as a different account, click your avatar → **Log Out**.

### Google OAuth Login

If Google Sign-In is configured by your admin, click **Continue with Google** to sign in instantly without a password.

---

## 2. Your Dashboard

The Dashboard is your headquarters — it shows live KPIs calculated from your MongoDB data.

### KPI Cards

| Card | What It Means |
|------|--------------|
| **Total Leads** | All non-archived leads in your pipeline |
| **Hot Leads** | Leads with score ≥ 70 and temperature = hot |
| **Pipeline Value** | Sum of estimated values across all active leads |
| **Win Rate** | Leads won ÷ total leads (%) |
| **Follow-ups Due** | Tasks scheduled for today |
| **Overdue** | Tasks past due date |

### Charts

- **Leads by Source**: Breakdown of where your leads come from (WhatsApp, website form, Meta Ads, etc.)
- **Conversion Funnel**: How many leads progress through each stage
- **Revenue by Month**: Closed deal revenue per month (from Deal records)
- **Team Performance**: Leaderboard of team members by leads won

> All chart data is calculated from your real MongoDB data. Empty charts mean no data yet — add leads to see them populate.

---

## 3. Today Workspace

The **Today** page is your daily sales execution HQ.

### What You'll See

- **Morning Greeting**: Personalized by time of day.
- **Priority Actions**: AI-ranked list of leads that need your attention most urgently.
- **Revenue At Risk**: High-value leads with no recent contact (48h threshold).
- **Lead Decay Detector**: Warm/hot leads that have gone silent for 72+ hours.

### Action Queue

Each card in the queue shows:
- **Lead name & company**
- **Channel** (WhatsApp, email, etc.)
- **Deal value** and **AI priority score**
- **Why now** — AI reasoning based on your actual lead data
- **Due time** — when the action is urgent

Click the circle checkbox to mark an action complete (local state). Click **Open Lead** to navigate to the full lead detail.

### Statistics Cards

| Card | Source |
|------|--------|
| Priority Actions | Count of leads with pending follow-ups |
| Revenue At Risk | Sum of estimated values for uncontacted leads |
| Hot Leads Waiting | Live count of hot-temperature leads |
| Scheduled Calls | Count of meeting_booked activities today |

---

## 4. Managing Leads

### Creating a Lead

1. Go to **Leads** → click **+ New Lead**
2. Fill in contact name, phone/email, lead source, and estimated value
3. Optionally add notes and assign to a team member
4. Click **Create Lead**

The system will automatically:
- Check for duplicates (same phone/email)
- Create an associated Contact record
- Assign a default follow-up sequence if configured

### Lead Detail View

Each lead has:
- **Overview**: Score, temperature, stage, estimated value, source, owner
- **Conversation**: Full message thread across all channels
- **AI Analysis**: Intent score, buying signals, objections, and recommendations
- **Follow-up Tasks**: Upcoming and completed tasks
- **Activity Log**: All events (calls logged, messages sent, stage changes)

### AI Lead Score

The score (0-100) is calculated from:
- Message content analysis (budget signals, urgency, pain points)
- Response time and engagement recency
- Buying signals and objections detected

Run **Analyze Lead** to generate or refresh the AI analysis. Scores are stored in the `AIAnalysis` collection and are not hardcoded.

### Lead Stages

| Stage | Meaning |
|-------|---------|
| New | Just entered the pipeline |
| Contacted | First outreach sent |
| Qualified | Budget, authority, need, timeline confirmed |
| Proposal | Proposal/quote sent |
| Negotiation | In pricing/terms discussion |
| Won | Deal closed |
| Lost | Lead churned |

### Archiving vs Deleting

Archiving hides a lead from the active pipeline but preserves all data. Use archive for lost or won leads you want to keep for reporting. Deleting is not offered in the UI to preserve analytics integrity.

---

## 5. Conversations & Messaging

### Channels

FollowUpOS supports multi-channel conversations:
- **WhatsApp** (via Meta Business Cloud API when configured)
- **Email** (via SMTP when configured)
- **Manual** (log calls, notes, in-person meetings)

### Sending a Message

1. Open a Lead → go to **Conversation** tab
2. Type your message or click **Generate AI Reply** to create one
3. Select channel and click **Send**

### AI Reply Generation

The AI uses:
- Your organization name, tone preference, and service description
- The full conversation history
- The lead's detected intent and pain points

The reply is generated by the configured AI provider (OpenAI or mock). You can regenerate or edit before sending.

### Tone Options

- Professional
- Friendly
- Urgent
- Consultative

---

## 6. AI Copilot

The Copilot answers questions about **your real sales data** — it queries your actual MongoDB records, not fake data.

### How to Use

1. Navigate to **Copilot** in the sidebar
2. Type your question in the chat input
3. The Copilot classifies your intent, queries MongoDB, and responds

### Example Queries

| Query | What Copilot Does |
|-------|------------------|
| "Which leads should I contact today?" | Lists leads with due follow-ups and hot temperature |
| "Show me overdue follow-ups" | Lists all pending tasks past their due date |
| "What's my pipeline worth?" | Sums active deal values with weighted forecast |
| "Who are my hot leads?" | Returns all leads with temperature = hot |
| "Summarize today's sales activity" | Shows total leads, hot count, tasks due, won this month |
| "Show leads going cold" | Lists warm/hot leads with no inbound activity in 7+ days |

### Data Privacy

The Copilot only accesses data for **your organization**. It cannot see data from other tenants on the platform.

---

## 7. Pipeline View

The Pipeline is a Kanban board showing leads organized by stage.

### Columns

Each column represents a stage: New → Contacted → Qualified → Proposal → Negotiation → Won/Lost.

### Drag & Drop

Drag leads between stages to update their status. This triggers an `Activity` record and updates `lastStageChangedAt`.

### Pipeline Value

The total at the top of each column shows the sum of `estimatedValue` for leads in that stage.

---

## 8. Analytics

The Analytics page shows data from MongoDB aggregation queries — all real, no samples.

### Date Range Filter

Use the date picker to filter all charts to a specific time window. The default is the last 30 days.

### Charts Available

1. **Overview KPIs**: Total leads, new leads, hot leads, conversion rate, won/lost, pipeline value
2. **Leads by Source**: Bar chart of lead origins with conversion rates per source
3. **Conversion Funnel**: Stage-by-stage drop-off
4. **Revenue by Month**: Won deal revenue over time
5. **Team Performance**: Leads per team member, win rate, avg score

> **Note**: If a chart is empty, it means no leads/deals match the criteria for that period. This is real data — FollowUpOS never shows sample data in Analytics.

---

## 9. Follow-ups & Automations

### Follow-up Sequences

A sequence is a series of timed messages sent to a lead automatically.

- Go to **Automations** → **Sequences** to create a sequence
- Add steps: Day 1 (WhatsApp), Day 3 (Email), Day 7 (WhatsApp re-engage)
- Set a sequence as the default for all new leads

### Assigning a Sequence

On any lead, click **Schedule Follow-up** → choose a sequence. The system creates `FollowUpTask` records for each step, to be sent at the configured intervals.

### Manual Follow-up Tasks

Create one-off tasks from a lead's detail page → **+ Add Follow-up**.

---

## 10. Contacts

The Contacts section stores people independently of leads.

- One contact can have multiple leads (e.g., they enquire again after 3 months)
- Contacts have: full name, company, email, phone, tags, and notes
- Link a contact to an existing lead or create a new lead from a contact

---

## 11. Billing & Plan Management

### Current Plan

The **Billing** page shows:
- Your current active plan and status
- Usage this month (leads, AI analyses, messages) vs. your limits
- Invoices from Razorpay

### Upgrading or Downgrading

1. Go to **Billing** → scroll to the Plan Comparison section
2. Click **Upgrade** on the plan you want
3. Complete payment via Razorpay (or test mode if not yet configured)

### Cancellation

Click **Cancel Subscription** → your plan remains active until the end of the current billing period.

### Test Mode Badge

If Razorpay is not configured with real keys, a **Test Mode** badge appears on the billing page. Payments are simulated and no real charges occur.

---

## 12. Settings

### Organization Settings

- Business name, logo, and primary color
- Default AI tone (Professional / Friendly / Urgent)
- Business hours (affects follow-up scheduling)
- Time zone

### Integrations

Connect live channels here:
- WhatsApp Business Cloud API
- Meta Lead Ads
- Google (Gmail + Calendar)
- Calendly
- LinkedIn

See [Integration Guide](./INTEGRATION_GUIDE.md) for setup steps.

### Team Management

- Invite team members by email
- Assign roles: Owner, Manager, Agent
- Owners can access all leads; Agents see only assigned leads

---

*For technical setup and deployment, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).*
*For integration setup, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md).*
*For API access, see [API_GUIDE.md](./API_GUIDE.md).*
