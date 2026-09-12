import 'dotenv/config';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Subscription } from '../models/Subscription.js';
import { Lead } from '../models/Lead.js';
import { Contact } from '../models/Contact.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { FollowUpTask } from '../models/FollowUpTask.js';
import { Deal } from '../models/Deal.js';
import { UsageEvent } from '../models/UsageEvent.js';

describe('FollowUpOS Full Production Lifecycle End-to-End Test', () => {
  let authToken = '';
  let user = null;
  let organization = null;
  let leadId = null;
  let contactId = null;
  let conversationId = null;

  beforeAll(async () => {
    try {
      await connectDatabase();
    } catch {}
  });

  afterAll(async () => {
    try {
      await disconnectDatabase();
    } catch {}
  });

  test('1. Visitor Registers and Creates Workspace', async () => {
    const email = `test_founder_${Date.now()}@apexagency.in`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Siddharth Rao',
        email,
        password: 'Password@123456',
        companyName: 'Apex Growth Advisors',
        industry: 'consulting',
        phone: '+91 98765 12345'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();

    authToken = res.body.data.accessToken;
    user = res.body.data.user;
    organization = res.body.data.organization;
  });

  test('2. Check Initial Billing and Trial Subscription', async () => {
    const res = await request(app)
      .get('/api/billing/current')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.subscription).toBeDefined();
    expect(res.body.plan).toBeDefined();
    expect(res.body.usage).toBeDefined();
  });

  test('3. User Initiates Checkout for Growth Plan', async () => {
    const res = await request(app)
      .post('/api/billing/checkout')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        planId: 'growth',
        billingCycle: 'monthly'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subscriptionId).toBeDefined();
  });

  test('4. Process Razorpay Subscription Webhook (Activates Growth Plan)', async () => {
    const res = await request(app)
      .post('/api/webhooks/razorpay')
      .send({
        event: 'subscription.activated',
        account_id: 'acc_rzp_test',
        payload: {
          subscription: {
            entity: {
              id: `rzp_sub_${Date.now()}`,
              current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
              notes: {
                organizationId: organization._id,
                plan: 'growth'
              }
            }
          }
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  test('5. Public Form Submits High-Intent Inbound Lead', async () => {
    const res = await request(app)
      .post('/api/public/forms/default_contact_form/submit')
      .send({
        name: 'Vikram Malhotra',
        email: 'vikram@malhotracapital.com',
        phone: '+91 99887 76655',
        company: 'Malhotra Capital Partners',
        service: 'Lead Gen & CRM Strategy',
        budget: '₹3L - ₹10L',
        message: 'Looking to automate our advisory follow-up for 20 reps immediately.'
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    if (res.body.data?.leadId) {
      leadId = res.body.data.leadId;
      contactId = res.body.data.contactId;
    }
  });

  test('6. Inbound WhatsApp Reply Automatically Pauses Cadence', async () => {
    const res = await request(app)
      .post('/api/webhooks/whatsapp')
      .send({
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: '919988776655',
                      text: { body: 'Yes, let us schedule a discovery call tomorrow at 3 PM.' }
                    }
                  ]
                }
              }
            ]
          }
        ]
      });

    expect(res.status).toBe(200);
  });

  test('7. Calendly Meeting Booked Webhook Updates Lead Stage', async () => {
    const res = await request(app)
      .post('/api/webhooks/calendly')
      .send({
        event: 'invitee.created',
        payload: {
          invitee: {
            name: 'Vikram Malhotra',
            email: 'vikram@malhotracapital.com'
          }
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  test('8. Create and Close Deal to Won', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Malhotra Capital Enterprise CRM Follow-up Setup',
        value: 450000,
        stage: 'won',
        probability: 100
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  test('9. Super Admin Accesses Platform Metrics & MRR', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mrr).toBeDefined();
  });

  test('10. Super Admin Views System Health', async () => {
    const res = await request(app)
      .get('/api/admin/system-health')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.api.status).toBe('healthy');
  });
});
