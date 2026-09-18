# FollowUpOS — Integration Guide

> Step-by-step setup for every channel integration

---

## Table of Contents

1. [WhatsApp Business Cloud API](#whatsapp-business-cloud-api)
2. [Meta Lead Ads (Facebook & Instagram)](#meta-lead-ads-facebook--instagram)
3. [Google (Gmail & Calendar)](#google-gmail--calendar)
4. [Calendly](#calendly)
5. [LinkedIn](#linkedin)
6. [Website Lead Form (Webhook)](#website-lead-form-webhook)
7. [Custom Webhook Ingestion](#custom-webhook-ingestion)
8. [Email (SMTP)](#email-smtp)
9. [Razorpay Billing](#razorpay-billing)

---

## 1. WhatsApp Business Cloud API

### Prerequisites

- Meta Business Account
- WhatsApp Business Account verified
- A dedicated phone number registered with WhatsApp Business

### Steps

1. Go to [developers.facebook.com](https://developers.facebook.com) → Create App → **Business**
2. Add **WhatsApp** product to your app
3. Go to WhatsApp → API Setup:
   - Copy **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - Copy **WhatsApp Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - Generate a **Permanent Access Token** → `WHATSAPP_ACCESS_TOKEN`
4. Set your App Secret → `WHATSAPP_APP_SECRET`
5. Configure Webhook:
   - Callback URL: `https://api.yourdomain.com/api/webhooks/whatsapp`
   - Verify Token: set to the value in `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to: `messages`

### In FollowUpOS

- Go to **Settings → Integrations → WhatsApp**
- Click **Connect** and enter your Phone Number ID
- Verify the connection

### Inbound Message Flow

`Meta → Webhook → /api/webhooks/whatsapp → create/update Lead → create Message`

---

## 2. Meta Lead Ads (Facebook & Instagram)

### Prerequisites

- Meta Business Manager with at least one lead gen form

### Steps

1. In your Meta App → Add **Facebook Login** and **Leads Access** products
2. Go to App Settings:
   - Copy **App ID** → `META_APP_ID`
   - Copy **App Secret** → `META_APP_SECRET`
3. Configure OAuth Redirect URI: `https://api.yourdomain.com/api/integrations/meta/callback`
4. Set `META_REDIRECT_URI` in `.env`
5. Configure Lead Ads Webhook:
   - Callback: `https://api.yourdomain.com/api/webhooks/meta`
   - Verify Token: `META_WEBHOOK_VERIFY_TOKEN`
   - Subscribe to: `leadgen`

### In FollowUpOS

- Go to **Settings → Integrations → Meta Lead Ads**
- Click **Connect with Facebook** (OAuth flow)
- Select the Facebook Page and Instagram account to sync leads from

---

## 3. Google (Gmail & Calendar)

### Prerequisites

- Google Cloud Console project with OAuth 2.0 credentials

### Steps

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Gmail API** and **Google Calendar API**
3. Go to Credentials → Create **OAuth 2.0 Client ID** (Web application)
4. Add Authorized Redirect URI: `https://api.yourdomain.com/api/auth/google/callback`
5. Copy credentials:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`
   - Redirect URI → `GOOGLE_REDIRECT_URI`

### In FollowUpOS

- Go to **Settings → Integrations → Google**
- Click **Connect Google Account**
- Grant access to Gmail and Calendar

### What Syncs

- Incoming Gmail threads from leads → FollowUpOS conversation
- Google Calendar bookings → Activity records (meeting_scheduled)

---

## 4. Calendly

### Prerequisites

- Calendly Pro or Teams account

### Steps

1. Go to [calendly.com/integrations/api_webhooks](https://calendly.com/integrations/api_webhooks)
2. Generate an **API Key** from your Calendly account
3. Create an OAuth App:
   - Redirect URI: `https://api.yourdomain.com/api/integrations/calendly/callback`
4. Copy:
   - Client ID → `CALENDLY_CLIENT_ID`
   - Client Secret → `CALENDLY_CLIENT_SECRET`
5. Note the **Webhook Signing Key** → `CALENDLY_WEBHOOK_SIGNING_KEY`

### In FollowUpOS

- Go to **Settings → Integrations → Calendly**
- Click **Connect Calendly**
- When a booking is made, FollowUpOS creates an Activity record (meeting_booked) linked to the lead

---

## 5. LinkedIn

### Steps

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers) → Create App
2. Add **Sign In with LinkedIn** and **Lead Gen Forms** products
3. Set Redirect URL: `https://api.yourdomain.com/api/integrations/linkedin/callback`
4. Copy:
   - Client ID → `LINKEDIN_CLIENT_ID`
   - Client Secret → `LINKEDIN_CLIENT_SECRET`

### In FollowUpOS

- Go to **Settings → Integrations → LinkedIn**
- Click **Connect LinkedIn**
- Lead Gen Form submissions will create leads automatically

---

## 6. Website Lead Form (Webhook)

FollowUpOS provides a hosted webhook endpoint to receive lead form submissions from any website.

### Endpoint

```
POST https://api.yourdomain.com/api/webhooks/website-form
```

### Headers

```
Authorization: Bearer <your-organization-api-key>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+919876543210",
  "message": "I'm interested in your digital marketing services",
  "source": "contact_form",
  "formId": "homepage-contact"
}
```

### Getting Your API Key

1. Go to **Settings → API Keys**
2. Click **Generate API Key**
3. Copy and use it in the `Authorization` header

### HTML Form Integration (Example)

```html
<form id="leadForm">
  <input name="name" placeholder="Your Name" required>
  <input name="email" type="email" placeholder="Email" required>
  <input name="phone" placeholder="Phone" required>
  <textarea name="message" placeholder="How can we help?"></textarea>
  <button type="submit">Send Enquiry</button>
</form>

<script>
document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(e.target))
  await fetch('https://api.yourdomain.com/api/webhooks/website-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify(data)
  })
  alert('Thank you! We will get back to you soon.')
})
</script>
```

---

## 7. Custom Webhook Ingestion

For CRMs, ad platforms, or internal tools that emit webhooks.

### Endpoint

```
POST https://api.yourdomain.com/api/webhooks/custom
Authorization: Bearer <api-key>
```

### Request Body (flexible)

```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "phone": "9876543210",
  "source": "facebook_ads",
  "campaign": "Jan 2026 Offer",
  "customField1": "value"
}
```

Fields are stored in `lead.customFields` if not mapped to standard fields.

---

## 8. Email (SMTP)

FollowUpOS sends transactional emails (welcome, verification, follow-ups) via SMTP.

### Gmail SMTP Setup

1. Enable **2-Step Verification** on your Google account
2. Go to Google Account → Security → App Passwords
3. Create an App Password for **Mail**
4. Use in `SMTP_PASSWORD`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youremail@gmail.com
SMTP_PASSWORD=your-16-char-app-password
EMAIL_FROM=youremail@gmail.com
```

### Other SMTP Providers

| Provider | Host | Port |
|---------|------|------|
| SendGrid | smtp.sendgrid.net | 587 |
| Mailgun | smtp.mailgun.org | 587 |
| AWS SES | email-smtp.region.amazonaws.com | 587 |

---

## 9. Razorpay Billing

### Setup

1. Create a [Razorpay account](https://razorpay.com)
2. Complete KYC verification
3. Go to Dashboard → Settings → API Keys:
   - Copy **Key ID** → `RAZORPAY_KEY_ID`
   - Copy **Key Secret** → `RAZORPAY_KEY_SECRET`

### Create Subscription Plans

1. Go to Razorpay Dashboard → Subscriptions → Plans → Create Plan
2. Create three plans matching `PLANS.js`:
   - Starter: ₹999/month
   - Growth: ₹2,999/month
   - Agency: ₹7,999/month
3. Copy each Plan ID to `.env`:
   ```
   RAZORPAY_PLAN_STARTER_MONTHLY=plan_...
   RAZORPAY_PLAN_GROWTH_MONTHLY=plan_...
   RAZORPAY_PLAN_AGENCY_MONTHLY=plan_...
   ```

### Webhook Setup

1. Go to Razorpay Dashboard → Settings → Webhooks → Add Webhook
2. URL: `https://api.yourdomain.com/api/billing/webhook/razorpay`
3. Secret: set `RAZORPAY_WEBHOOK_SECRET`
4. Events to subscribe: `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`

### Test Mode

- Use test keys (`rzp_test_...`) during development
- Test card: `4111 1111 1111 1111`, CVV: any 3 digits, Expiry: any future date
- UPI test: use `success@razorpay` for success simulation

---

*For deployment configuration, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).*
*For API access, see [API_GUIDE.md](./API_GUIDE.md).*
