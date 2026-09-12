import 'dotenv/config';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Lead } from '../models/Lead.js';
import { Contact } from '../models/Contact.js';
import { Deal } from '../models/Deal.js';
import { Integration } from '../models/Integration.js';

describe('FollowUpOS Multi-Tenant Isolation & Security Hardening Test Suite', () => {
  let userA = null;
  let tokenA = '';
  let orgA = null;

  let userB = null;
  let tokenB = '';
  let orgB = null;

  let salesRepTokenA = '';

  let leadBId = null;
  let contactBId = null;
  let dealBId = null;

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

  test('1. Register Two Separate Organizations (Org A & Org B)', async () => {
    const emailA = `tenant_a_${Date.now()}@agencya.com`;
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Founder Alpha',
        email: emailA,
        password: 'Password@123456',
        companyName: 'Alpha Advisory Group',
        industry: 'consulting',
      });

    expect(resA.status).toBe(201);
    tokenA = resA.body.data.accessToken;
    userA = resA.body.data.user;
    orgA = resA.body.data.organization;

    const emailB = `tenant_b_${Date.now()}@agencyb.com`;
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Founder Beta',
        email: emailB,
        password: 'Password@123456',
        companyName: 'Beta Growth Partners',
        industry: 'marketing',
      });

    expect(resB.status).toBe(201);
    tokenB = resB.body.data.accessToken;
    userB = resB.body.data.user;
    orgB = resB.body.data.organization;
  });

  test('2. Populate Sensitive Data in Org B (Lead, Contact, Deal)', async () => {
    const contactB = await Contact.create({
      organizationId: orgB._id,
      firstName: 'Confidential',
      lastName: 'Client B',
      fullName: 'Confidential Client B',
      email: 'clientb@secretcorp.com',
      phone: '+91 91111 22222',
      company: 'Secret Corp B',
    });
    contactBId = contactB._id.toString();

    const leadB = await Lead.create({
      organizationId: orgB._id,
      contactId: contactB._id,
      ownerId: userB._id,
      title: 'Confidential M&A Deal — $500k',
      status: 'qualified',
      stage: 'proposal',
      estimatedValue: 500000,
    });
    leadBId = leadB._id.toString();

    const dealB = await Deal.create({
      organizationId: orgB._id,
      name: 'Secret Enterprise Rollout',
      title: 'Secret Enterprise Rollout',
      value: 750000,
      stage: 'proposal',
      probability: 70,
    });
    dealBId = dealB._id.toString();
  });

  test('3. Org A Cannot Read Org B Lead (IDOR Prevention)', async () => {
    const res = await request(app)
      .get(`/api/leads/${leadBId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    // Must be 404 (not found in Org A scope) or 403
    expect([403, 404]).toContain(res.status);
  });

  test('4. Org A Cannot Modify Org B Lead', async () => {
    const res = await request(app)
      .patch(`/api/leads/${leadBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Hacked Title By Competitor',
      });

    expect([403, 404]).toContain(res.status);

    // Verify lead B was not modified
    const checkLead = await Lead.findById(leadBId);
    expect(checkLead.title).toBe('Confidential M&A Deal — $500k');
  });

  test('5. Org A Cannot Access Org B Contact or Deal', async () => {
    const resContact = await request(app)
      .get(`/api/contacts/${contactBId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect([403, 404]).toContain(resContact.status);

    const resDeal = await request(app)
      .get(`/api/deals/${dealBId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect([403, 404]).toContain(resDeal.status);
  });

  test('6. Integration Test Connection Rejects Invalid Credentials with Useful Error', async () => {
    const res = await request(app)
      .post('/api/integrations/email/test')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        credentials: {
          host: 'smtp.invalid-domain-xyz-123.com',
          port: 587,
          user: 'fake@invalid.com',
          pass: 'wrongpassword',
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  test('7. Org A Saves Integration with Encrypted Credentials and Receives Masked Key', async () => {
    const res = await request(app)
      .post('/api/integrations/whatsapp/configure')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        credentials: {
          phoneNumberId: '109283746592837',
          businessAccountId: '982736451029384',
          accessToken: 'EAAG_very_secret_permanent_token_xyz_9988',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('connected');
    expect(res.body.data.maskedCredentials.accessToken).toContain('EAAG••••••••');

    // Fetch integration list for Org A
    const listRes = await request(app)
      .get('/api/integrations')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(listRes.status).toBe(200);
    const whatsapp = listRes.body.data.integrations.find((i) => i.provider === 'whatsapp');
    expect(whatsapp.status).toBe('connected');
    expect(whatsapp.maskedCredentials.accessToken).toContain('EAAG••••••••');
    // Ensure plaintext token is never exposed
    expect(JSON.stringify(listRes.body)).not.toContain('EAAG_very_secret_permanent_token_xyz_9988');

    // Verify DB entry has encrypted credentials, not plaintext
    const dbIntegration = await Integration.findOne({ organizationId: orgA._id, provider: 'whatsapp' })
      .select('+encryptedCredentials');
    expect(dbIntegration.encryptedCredentials).toBeDefined();
    expect(dbIntegration.encryptedCredentials).not.toBe('EAAG_very_secret_permanent_token_xyz_9988');
  });

  test('8. Org B Does Not See Org A Connected Integration', async () => {
    const res = await request(app)
      .get('/api/integrations')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    const whatsappB = res.body.data.integrations.find((i) => i.provider === 'whatsapp');
    expect(whatsappB.status).toBe('not_connected');
    expect(whatsappB.maskedCredentials).toEqual({});
  });

  test('9. Public Developer API Key Lifecycle: Ingestion, Rotation & Revocation', async () => {
    // 1. Rotate API key for Org A
    const rotateRes = await request(app)
      .post('/api/integrations/api-key/rotate')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(rotateRes.status).toBe(200);
    expect(rotateRes.body.data.apiKey).toMatch(/^fup_live_/);
    const apiKeyA = rotateRes.body.data.apiKey;

    // 2. Ingest lead using this valid API key
    const ingestRes = await request(app)
      .post('/api/public/leads')
      .set('Authorization', `Bearer ${apiKeyA}`)
      .send({
        name: 'Devin Lead',
        email: 'devin@ai-agency.com',
        phone: '+91 98765 44332',
        company: 'Devin AI Solutions',
        service: 'Full Sales Automation',
        message: 'Inbound lead via public REST API',
      });

    expect(ingestRes.status).toBe(201);
    expect(ingestRes.body.success).toBe(true);

    // Verify lead was stored under Org A
    const createdLead = await Lead.findById(ingestRes.body.data.leadId);
    expect(createdLead.organizationId.toString()).toBe(orgA._id.toString());

    // 3. Attempt with invalid key
    const invalidRes = await request(app)
      .post('/api/public/leads')
      .set('Authorization', 'Bearer fup_live_forged_key_12345678')
      .send({
        name: 'Hacker Lead',
        email: 'hacker@malicious.com',
      });

    expect(invalidRes.status).toBe(401);

    // 4. Revoke API Key
    const revokeRes = await request(app)
      .post('/api/integrations/api-key/revoke')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(revokeRes.status).toBe(200);

    // 5. Ingestion with revoked key must fail
    const revokedRes = await request(app)
      .post('/api/public/leads')
      .set('Authorization', `Bearer ${apiKeyA}`)
      .send({
        name: 'Post-Revoke Lead',
        email: 'post@agency.com',
      });

    expect(revokedRes.status).toBe(401);
  });

  test('10. Disconnect Integration Clears Encrypted Tokens', async () => {
    const res = await request(app)
      .post('/api/integrations/whatsapp/disconnect')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const checkIntegration = await Integration.findOne({ organizationId: orgA._id, provider: 'whatsapp' })
      .select('+encryptedCredentials');
    expect(checkIntegration.status).toBe('not_connected');
    expect(checkIntegration.encryptedCredentials).toBeNull();
  });
});
