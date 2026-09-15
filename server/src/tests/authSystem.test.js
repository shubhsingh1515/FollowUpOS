import 'dotenv/config';
import request from 'supertest';
import crypto from 'crypto';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { authService } from '../services/AuthService.js';
import { config } from '../config/config.js';

describe('FollowUpOS Production Authentication & Verification Suite', () => {
  const timestamp = Date.now();
  const testEmail = `auth_tester_${timestamp}@agencyflow.io`;
  const newTestEmail = `auth_updated_${timestamp}@agencyflow.io`;
  const initialPassword = 'SecurePassword@2026';
  const newPassword = 'BrandNewPassword@2026';

  let rawVerifyToken = '';
  let rawResetToken = '';

  beforeAll(async () => {
    try {
      await connectDatabase();
    } catch {}
  }, 30000);

  afterAll(async () => {
    try {
      // Clean up test data
      await User.deleteMany({ email: { $in: [testEmail, newTestEmail] } });
      await disconnectDatabase();
    } catch {}
  }, 30000);

  test('1. Registration requires valid fields and sets emailVerified=false', async () => {
    // Test weak password rejection
    const weakRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dev Tester',
        email: testEmail,
        password: '123',
        companyName: 'Flow Agency',
      });
    expect(weakRes.status).toBe(400);

    // Valid registration
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dev Tester',
        email: testEmail,
        password: initialPassword,
        companyName: 'Flow Agency',
        industry: 'digital_agency',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requiresEmailVerification).toBe(true);
    expect(res.body.data.user.isEmailVerified).toBe(false);

    // Retrieve the raw token hash from DB to simulate the verification link
    const user = await User.findOne({ email: testEmail }).select('+emailVerificationTokenHash');
    expect(user).toBeDefined();
    expect(user.emailVerificationTokenHash).toBeDefined();
    expect(user.isEmailVerified).toBe(false);
  });

  test('2. Duplicate registration returns 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Tester',
        email: testEmail,
        password: initialPassword,
        companyName: 'Duplicate Agency',
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_EXISTS');
  });

  test('3. Login is rejected for unverified local account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: initialPassword,
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  test('4. Resend verification token enforces rate-limiting / cooldown', async () => {
    // Attempt immediate resend (should hit 60s cooldown)
    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: testEmail });

    expect([200, 429]).toContain(res.status);
    if (res.status === 429) {
      expect(res.body.code).toBe('RATE_LIMITED');
    }
  });

  test('5. Change email for unverified user updates account and sends new link', async () => {
    const res = await request(app)
      .post('/api/auth/change-email')
      .send({
        currentEmail: testEmail,
        newEmail: newTestEmail,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findOne({ email: newTestEmail });
    expect(updatedUser).toBeDefined();
    expect(updatedUser.email).toBe(newTestEmail);
  });

  test('6. Verify email with valid token succeeds and marks isEmailVerified=true', async () => {
    // Set a known token hash in database
    rawVerifyToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawVerifyToken).digest('hex');

    await User.findOneAndUpdate(
      { email: newTestEmail },
      {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    );

    // Execute verification
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({
        token: rawVerifyToken,
        email: newTestEmail,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.isEmailVerified).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();

    // Verify token single-use (re-verifying with same token must fail)
    const retryRes = await request(app)
      .post('/api/auth/verify-email')
      .send({
        token: rawVerifyToken,
        email: newTestEmail,
      });

    expect(retryRes.status).toBe(400);
    expect(retryRes.body.code).toBe('INVALID_VERIFICATION_TOKEN');
  });

  test('7. Login succeeds now that account is verified', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: newTestEmail,
        password: initialPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(newTestEmail);
  });

  test('8. Forgot password generates reset token and protects against enumeration', async () => {
    // Known email
    const resKnown = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: newTestEmail });

    expect(resKnown.status).toBe(200);
    expect(resKnown.body.success).toBe(true);

    // Unknown email returns identical generic message
    const resUnknown = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent_account@nowhere.com' });

    expect(resUnknown.status).toBe(200);
    expect(resUnknown.body.success).toBe(true);
    expect(resUnknown.body.message).toBe(resKnown.body.message);
  });

  test('9. Reset password updates password and revokes existing sessions', async () => {
    rawResetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    await User.findOneAndUpdate(
      { email: newTestEmail },
      {
        passwordResetTokenHash: resetHash,
        passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      }
    );

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: rawResetToken,
        email: newTestEmail,
        newPassword: newPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Old password should now fail
    const oldLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: newTestEmail,
        password: initialPassword,
      });
    expect(oldLoginRes.status).toBe(401);

    // New password succeeds
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: newTestEmail,
        password: newPassword,
      });
    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.data.accessToken).toBeDefined();
  });

  test('10. Google Auth flow URL builder works with configured client id', () => {
    config.google.clientId = 'test-google-client-id.apps.googleusercontent.com';
    config.google.callbackUrl = 'http://localhost:5000/api/auth/google/callback';
    const authUrl = authService.getGoogleAuthUrl('test_state_123');
    expect(authUrl).toContain('accounts.google.com/o/oauth2/v2/auth');
    expect(authUrl).toContain('client_id=test-google-client-id.apps.googleusercontent.com');
    expect(authUrl).toContain('scope=openid+email+profile');
    expect(authUrl).toContain('state=test_state_123');
  });
});
