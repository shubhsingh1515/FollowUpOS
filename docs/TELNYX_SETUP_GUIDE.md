# Telnyx Account & AI Voice Calling Setup Guide

This guide provides step-by-step instructions for connecting your organization's Telnyx account to **FollowUpOS** to enable production-grade AI outbound and inbound voice calls.

---

## Prerequisites

1. An active [Telnyx Account](https://telnyx.com).
2. A Telnyx API Key (V2).
3. At least one active phone number in E.164 format (e.g. `+14155550199`).

---

## Step 1: Obtain Your Telnyx API Key

1. Log into your [Telnyx Portal](https://portal.telnyx.com).
2. Navigate to **Account Settings** → **API Keys**.
3. Click **Create API Key**.
4. Copy the generated API Key. (e.g., `KEY018...`).

---

## Step 2: Connect Telnyx in FollowUpOS

1. Log into your **FollowUpOS** account.
2. Go to **Settings** → **Integrations** or **AI Voice Calling** → **Connect Telnyx**.
3. Paste your **Telnyx API Key**.
4. Click **Connect & Verify**.
5. FollowUpOS will test your API key directly against the Telnyx REST API (`/v2/phone_numbers`). Upon verification, your status will change to **ACTIVE & CONNECTED**.

> **Note**: Your API Key is encrypted at rest using AES-256 and is never exposed in client-side HTTP responses.

---

## Step 3: Configure Your AI Voice Agent

1. Go to **AI Voice Calling** → **AI Agents**.
2. Click **Create AI Voice Agent**.
3. Define your agent:
   - **Name**: e.g., *Inbound Qualification Specialist*
   - **Voice**: Choose from Alloy, Echo, Fable, Onyx, Nova, or Shimmer.
   - **Conversational Prompt**: Use dynamic placeholders such as `{{lead.firstName}}`, `{{lead.company}}`, `{{organization.name}}`.
4. Click **Save Agent**.

---

## Step 4: Acquire or Assign a Phone Number

1. Go to **AI Voice Calling** → **Phone Numbers**.
2. Click **Get New Phone Number** to search available numbers by area code (e.g., `415`).
3. Purchase a number ($1/mo billed to your Telnyx account).
4. Assign your AI Voice Agent to the phone number for automated inbound call handling.

---

## Step 5: Test & Launch Voice Calls

### Single Lead Call
1. Open any lead in **Leads Directory**.
2. Click **AI Call**.
3. Select your AI Voice Agent and target phone number.
4. Click **Start AI Call**.

### Outbound Campaigns
1. Go to **AI Voice Calling** → **Campaigns**.
2. Click **Create Voice Campaign**.
3. Select your target lead segment, AI Agent, and calling schedule.
4. Click **Start Campaign**.

---

## Webhook Configuration

FollowUpOS automatically handles incoming Telnyx Call Control events via:
`POST /api/webhooks/telnyx/voice`

Supported Call Control events:
- `call.initiated`
- `call.answered`
- `call.speak.ended`
- `call.hangup` / `call.completed`
- `call.machine.detection.ended` (Voicemail Detection)

All webhooks incorporate idempotency checks using unique event IDs to prevent duplicate record processing.
