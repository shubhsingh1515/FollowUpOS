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
      const state = req.query.state || 'google_auth';
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
    const clientBase = (config.client.url || 'http://localhost:5173').replace(/\/+$/, '');

    if (error) {
      logger.warn('Google OAuth cancelled or returned error:', error);
      return res.redirect(`${clientBase}/login?error=${encodeURIComponent('Google sign-in was cancelled.')}`);
    }

    if (!code) {
      return res.redirect(`${clientBase}/login?error=${encodeURIComponent('Missing authorization code from Google.')}`);
    }

    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const incomingCallback = host ? `${protocol}://${host}${req.baseUrl}${req.path}` : null;
      const redirectUri = config.google.callbackUrl || incomingCallback;

      const result = await authService.handleGoogleCallback({ code, state, redirectUri });

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

