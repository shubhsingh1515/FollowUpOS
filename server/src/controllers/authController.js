import mongoose from 'mongoose';
import { authService } from '../services/AuthService.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

export const authController = {
  async register(req, res) {
    const { name, email, password, companyName, industry, phone } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const mockUser = {
        _id: `user-${Date.now()}`,
        name: name || 'Demo User',
        email: email || 'demo@followupos.com',
        role: 'owner',
        isEmailVerified: true
      };
      const mockOrg = {
        _id: `org-${Date.now()}`,
        name: companyName || 'My Agency',
        slug: 'my-agency',
        plan: 'growth',
        isDemo: true,
      };
      const accessToken = jwt.sign(
        { userId: mockUser._id, organizationId: mockOrg._id, role: mockUser.role },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiry }
      );
      return res.status(201).json({
        success: true,
        message: 'Account created successfully (Demo Mode)',
        data: {
          user: mockUser,
          organization: mockOrg,
          accessToken,
        },
      });
    }

    const result = await authService.register({ name, email, password, companyName, industry, phone });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      data: {
        user: result.user,
        organization: result.organization,
        accessToken: result.accessToken,
        requiresEmailVerification: true,
        email: result.email,
      },
    });
  },

  async login(req, res) {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        organization: result.organization,
        accessToken: result.accessToken,
      },
    });
  },

  async googleAuth(req, res) {
    try {
      let clientOrigin = req.query.clientUrl || '';
      if (!clientOrigin && req.headers.referer) {
        try {
          clientOrigin = new URL(req.headers.referer).origin;
        } catch {}
      }

      let state = req.query.state || 'google_auth';
      if (clientOrigin) {
        try {
          state = Buffer.from(JSON.stringify({ s: state, origin: clientOrigin })).toString('base64url');
        } catch {}
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const incomingCallback = host ? `${protocol}://${host}${req.baseUrl}/google/callback` : null;
      const redirectUri = config.google.callbackUrl || incomingCallback;

      const authUrl = authService.getGoogleAuthUrl(state, redirectUri);
      res.redirect(authUrl);
    } catch (err) {
      logger.error('Failed to initiate Google OAuth:', err);
      res.status(err.statusCode || 500).json({
        success: false,
        code: err.code || 'GOOGLE_AUTH_ERROR',
        message: err.message || 'Failed to initiate Google sign-in',
      });
    }
  },

  async googleCallback(req, res) {
    const { code, state, error } = req.query;

    let clientBase = '';
    let resolvedState = state;

    if (state && state !== 'google_auth') {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
        if (decoded?.origin) {
          clientBase = decoded.origin;
          resolvedState = decoded.s || 'google_auth';
        }
      } catch {}
    }

    if (!clientBase && config.client.url) {
      clientBase = config.client.url;
    }

    const host = req.headers['x-forwarded-host'] || req.get('host');
    if (host && clientBase.includes(host)) {
      logger.warn(`CLIENT_URL points to backend host (${host}). Falling back to frontend default.`);
      clientBase = process.env.APP_URL && !process.env.APP_URL.includes(host)
        ? process.env.APP_URL
        : 'http://localhost:5173';
    }

    clientBase = (clientBase || 'http://localhost:5173').replace(/\/+$/, '');

    if (error) {
      logger.warn('Google OAuth cancelled or returned error:', error);
      return res.redirect(`${clientBase}/login?error=${encodeURIComponent('Google sign-in was cancelled.')}`);
    }

    if (!code) {
      return res.redirect(`${clientBase}/login?error=${encodeURIComponent('Missing authorization code from Google.')}`);
    }

    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const incomingCallback = host ? `${protocol}://${host}${req.baseUrl}${req.path}` : null;
      const redirectUri = config.google.callbackUrl || incomingCallback;

      const result = await authService.handleGoogleCallback({ code, state: resolvedState, redirectUri });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend callback handler with access token
      const redirectTarget = `${clientBase}/auth/callback?token=${encodeURIComponent(result.accessToken)}&isNew=${result.isNewUser ? 'true' : 'false'}`;
      res.redirect(redirectTarget);
    } catch (err) {
      logger.error('Google OAuth callback failed:', err);
      const errorMsg = err.message || 'Google sign-in failed. Please try again.';
      res.redirect(`${clientBase}/login?error=${encodeURIComponent(errorMsg)}`);
    }
  },

  fallbackClientCallback(req, res) {
    const { token, isNew, error } = req.query;
    let clientBase = (config.client.url || 'http://localhost:5173').replace(/\/+$/, '');
    const host = req.headers['x-forwarded-host'] || req.get('host');

    if (!host || !clientBase.includes(host)) {
      const target = `${clientBase}/auth/callback?token=${encodeURIComponent(token || '')}&isNew=${isNew === 'true' ? 'true' : 'false'}${error ? `&error=${encodeURIComponent(error)}` : ''}`;
      return res.redirect(target);
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>FollowUpOS — Completing Sign-in</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #08090C; color: #E4E4E7; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #0E1118; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          h2 { color: #FFFFFF; margin-top: 0; font-size: 20px; font-weight: 700; }
          p { font-size: 13px; color: #A1A1AA; line-height: 1.6; }
          .btn { display: inline-block; background: #6366F1; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 13px; margin: 16px 0; transition: background 0.2s; }
          .btn:hover { background: #4F46E5; }
          .hint { font-size: 11px; color: #71717A; margin-top: 20px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
          code { color: #818CF8; background: rgba(99,102,241,0.1); padding: 2px 6px; border-radius: 4px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>✓ Google Sign-in Successful</h2>
          <p>Your session token has been generated. Click below to open your FollowUpOS dashboard:</p>
          <a id="target-link" class="btn" href="http://localhost:5173/auth/callback?token=${encodeURIComponent(token || '')}&isNew=${isNew || 'false'}">
            Continue to FollowUpOS &rarr;
          </a>
          <div class="hint">
            <strong>Configuration Tip:</strong> In your Render dashboard environment variables, set <code>CLIENT_URL</code> to your frontend app domain (e.g. <code>http://localhost:5173</code> or your deployed frontend domain) instead of the backend API URL.
          </div>
        </div>
        <script>
          const token = ${JSON.stringify(token || '')};
          const isNew = ${JSON.stringify(isNew || 'false')};
          const defaultFrontend = 'http://localhost:5173/auth/callback?token=' + encodeURIComponent(token) + '&isNew=' + isNew;
          document.getElementById('target-link').href = defaultFrontend;
          setTimeout(() => {
            window.location.href = defaultFrontend;
          }, 1200);
        </script>
      </body>
      </html>
    `);
  },

  async googleToken(req, res) {
    const { idToken, credential } = req.body;
    const token = idToken || credential;
    const result = await authService.verifyGoogleIdToken(token);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Google sign-in successful',
      data: {
        user: result.user,
        organization: result.organization,
        accessToken: result.accessToken,
        isNewUser: result.isNewUser,
      },
    });
  },

  async verifyEmail(req, res) {
    const { token, email } = req.body;
    const result = await authService.verifyEmail({ token, email });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        organization: result.organization,
        accessToken: result.accessToken,
      },
    });
  },

  async resendVerification(req, res) {
    const email = req.body.email || req.user?.email;
    const result = await authService.resendVerification(email);
    res.json(result);
  },

  async changeVerificationEmail(req, res) {
    const { currentEmail, newEmail } = req.body;
    const result = await authService.changeVerificationEmail({ currentEmail, newEmail });
    res.json(result);
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(result);
  },

  async resetPassword(req, res) {
    const { token, email, newPassword } = req.body;
    const result = await authService.resetPassword({ token, email, newPassword });
    res.json(result);
  },

  async logout(req, res) {
    try {
      let userId = req.user?._id;
      if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.decode(token);
        if (decoded?.userId) {
          userId = decoded.userId;
        }
      }
      if (userId && mongoose.connection.readyState === 1) {
        await authService.logout(userId);
      }
    } catch (err) {
      logger.warn('Error during logout session cleanup:', err?.message);
    }
    res.clearCookie('refreshToken');
    if (req.method === 'GET') {
      return res.redirect(`${config.client.url}/login`);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  },

  async refresh(req, res) {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required', code: 'NO_REFRESH_TOKEN' });
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  },

  async me(req, res) {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          user: {
            _id: req.user?._id || '660000000000000000000001',
            name: req.user?.name || 'Arjun Kapoor',
            email: req.user?.email || 'demo@followupos.com',
            role: 'owner',
            platformRole: 'super_admin'
          },
          organization: {
            _id: req.organizationId || '660000000000000000000002',
            name: 'GrowthScale Agency',
            plan: 'growth',
            isDemo: true,
          },
        },
      });
    }

    const { user, organization } = await authService.getCurrentUser(req.user._id);
    res.json({
      success: true,
      data: { user, organization },
    });
  },

  async changePassword(req, res) {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, message: 'Password changed successfully (Demo Mode)' });
    }
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  },
};

export default authController;

