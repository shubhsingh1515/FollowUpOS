# FollowUpOS — API Guide

> For developers integrating with or extending FollowUpOS

---

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL & Headers](#base-url--headers)
3. [Rate Limiting](#rate-limiting)
4. [Leads API](#leads-api)
5. [Contacts API](#contacts-api)
6. [Conversations API](#conversations-api)
7. [Analytics API](#analytics-api)
8. [Follow-ups API](#follow-ups-api)
9. [Copilot API](#copilot-api)
10. [Billing API](#billing-api)
11. [Webhooks](#webhooks)
12. [Error Codes](#error-codes)

---

## 1. Authentication

All API requests require a JWT access token in the `Authorization` header.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "organization": { "id": "...", "name": "..." },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJ..." }
```

### Token Lifecycle

| Token | Expiry |
|-------|--------|
| `accessToken` | 15 minutes |
| `refreshToken` | 7 days |

---

## 2. Base URL & Headers

```
Base URL: https://api.yourdomain.com/api
```

### Required Headers

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

---

## 3. Rate Limiting

| Endpoint Group | Limit |
|---------------|-------|
| Auth endpoints | 20 requests / 15 min per IP |
| General API | 200 requests / 15 min per user |
| AI endpoints | 60 requests / hour per org |
| Webhooks | 500 requests / minute per IP |

Rate limit errors return `429 Too Many Requests`.

---

## 4. Leads API

### List Leads

```http
GET /api/leads
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by stage: `new`, `contacted`, `qualified`, `proposal`, `negotiation`, `won`, `lost` |
| `temperature` | string | `hot`, `warm`, `cold` |
| `source` | string | `whatsapp`, `website_form`, `meta_ads`, etc. |
| `minScore` | number | Minimum lead score (0-100) |
| `maxScore` | number | Maximum lead score |
| `search` | string | Full-text search on name/company |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (max: 100, default: 20) |
| `sortBy` | string | `createdAt`, `leadScore`, `estimatedValue` |
| `sortOrder` | string | `asc` or `desc` |

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [...],
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Get Lead

```http
GET /api/leads/:id
```

### Create Lead

```http
POST /api/leads
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@company.com",
  "phone": "+919876543210",
  "source": "website_form",
  "estimatedValue": 50000,
  "notes": "Interested in digital marketing package",
  "assignTo": "<userId>"
}
```

### Update Lead

```http
PATCH /api/leads/:id
Content-Type: application/json

{
  "status": "qualified",
  "estimatedValue": 75000,
  "notes": "Budget confirmed at ₹75,000"
}
```

### Archive Lead

```http
DELETE /api/leads/:id
```

### Get Today's Priorities

```http
GET /api/leads/priorities
```

Returns AI-ranked priority actions calculated from real lead data.

### Run AI Analysis

```http
POST /api/leads/:id/analyze
```

Triggers real AI analysis of the lead's conversation. Stores result in `AIAnalysis` collection.

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 78,
    "temperature": "hot",
    "intent": "purchase",
    "budget": { "min": 50000, "max": 75000, "currency": "INR" },
    "timeline": "this month",
    "summary": "...",
    "recommendedAction": "Send a detailed proposal immediately",
    "buyingSignals": ["Asked about timeline", "Mentioned budget"],
    "objections": ["Concerned about delivery time"]
  }
}
```

### Generate AI Reply

```http
POST /api/leads/:id/generate-reply
Content-Type: application/json

{
  "tone": "professional",
  "instruction": "Mention our case study from the education sector"
}
```

### Get Score Explanation

```http
GET /api/leads/:id/score-explanation
```

Returns factors from the latest stored AI analysis.

### Get Objections

```http
GET /api/leads/:id/objections
```

Returns objections extracted from the latest AI analysis.

---

## 5. Contacts API

### List Contacts

```http
GET /api/contacts?search=john&page=1&limit=20
```

### Get Contact

```http
GET /api/contacts/:id
```

### Create Contact

```http
POST /api/contacts
Content-Type: application/json

{
  "fullName": "Priya Sharma",
  "email": "priya@startupco.in",
  "phone": "+919876543210",
  "company": "Startup Co.",
  "tags": ["enterprise", "high-value"]
}
```

### Update Contact

```http
PATCH /api/contacts/:id
```

---

## 6. Conversations API

### Get Conversation for Lead

```http
GET /api/leads/:leadId/conversation
```

### Send Message

```http
POST /api/leads/:leadId/messages
Content-Type: application/json

{
  "content": "Hello! Thanks for reaching out...",
  "channel": "whatsapp",
  "aiGenerated": false
}
```

---

## 7. Analytics API

### Overview KPIs

```http
GET /api/analytics/overview?startDate=2026-01-01&endDate=2026-09-18
```

### Leads by Source

```http
GET /api/analytics/leads-by-source?startDate=2026-08-01
```

### Conversion Funnel

```http
GET /api/analytics/funnel
```

### Revenue by Month

```http
GET /api/analytics/revenue?months=6
```

### Team Performance

```http
GET /api/analytics/team?startDate=2026-09-01
```

### Leads Trend

```http
GET /api/analytics/trend?days=30
```

All analytics endpoints return **real MongoDB aggregation data** for your organization only.

---

## 8. Follow-ups API

### List Follow-up Tasks

```http
GET /api/followups?status=pending&leadId=<id>
```

### Create Task

```http
POST /api/followups
Content-Type: application/json

{
  "leadId": "<lead-id>",
  "channel": "whatsapp",
  "scheduledAt": "2026-09-20T10:00:00.000Z",
  "message": "Following up on our earlier conversation..."
}
```

### Mark Complete

```http
PATCH /api/followups/:id
{ "status": "completed" }
```

### List Sequences

```http
GET /api/followups/sequences
```

---

## 9. Copilot API

```http
POST /api/copilot/query
Content-Type: application/json

{ "query": "Which leads should I contact today?" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Which leads should I contact today?",
    "intent": "leads_today",
    "answer": {
      "type": "leads_list",
      "text": "You have 3 priority leads to contact today...",
      "leads": [
        {
          "id": "...",
          "name": "Rajesh Kumar",
          "company": "TechStartup Pvt Ltd",
          "score": 82,
          "temperature": "hot",
          "reason": "Follow-up due at 10:00 AM"
        }
      ],
      "count": 3
    },
    "timestamp": "2026-09-18T21:00:00.000Z"
  }
}
```

### Response Types

| `type` | Contents |
|--------|----------|
| `leads_list` | Array of `leads` with scores and reasons |
| `opportunities` | Pipeline `deals` with values and probabilities |
| `followups_list` | Array of `tasks` with channels and due times |
| `summary` | `stats` object with KPI counts |
| `performance` | `winRate`, `totalLeads`, `wonLeads` |
| `general` | Just `text` response |

---

## 10. Billing API

### Get Current Subscription

```http
GET /api/billing/current
```

### Get Available Plans

```http
GET /api/billing/plans
```

### Create Checkout Session

```http
POST /api/billing/checkout
Content-Type: application/json

{
  "planId": "growth",
  "billingCycle": "monthly"
}
```

Returns Razorpay subscription ID and key for frontend checkout.

### Cancel Subscription

```http
POST /api/billing/cancel
Content-Type: application/json

{
  "atPeriodEnd": true,
  "reason": "Switching tools"
}
```

### Get Invoices

```http
GET /api/billing/invoices
```

---

## 11. Webhooks

### Inbound Webhooks (Lead Ingestion)

| Channel | URL | Method |
|---------|-----|--------|
| WhatsApp | `/api/webhooks/whatsapp` | POST |
| Meta Lead Ads | `/api/webhooks/meta` | POST |
| Website Form | `/api/webhooks/website-form` | POST |
| Custom | `/api/webhooks/custom` | POST |
| Calendly | `/api/webhooks/calendly` | POST |

### Outbound Webhooks (Coming Soon)

Configure outbound webhooks to notify your systems when:
- A new lead is created
- A lead reaches "Won"
- A follow-up is completed

---

## 12. Error Codes

| HTTP Code | Code | Description |
|-----------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body |
| 401 | `UNAUTHORIZED` | Missing or invalid access token |
| 401 | `TOKEN_EXPIRED` | Access token expired — refresh it |
| 403 | `FORBIDDEN` | You don't have permission for this resource |
| 404 | `LEAD_NOT_FOUND` | Lead ID not found in your organization |
| 409 | `DUPLICATE_LEAD` | Lead with this phone/email already exists |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 429 | `USAGE_LIMIT_EXCEEDED` | Monthly plan limit reached |
| 500 | `INTERNAL_ERROR` | Server error — check server logs |

### Error Response Format

```json
{
  "success": false,
  "message": "Lead not found",
  "code": "LEAD_NOT_FOUND",
  "statusCode": 404
}
```

---

*For deployment, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).*
*For channel integrations, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md).*
