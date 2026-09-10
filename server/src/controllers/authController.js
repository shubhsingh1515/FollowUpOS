import mongoose from 'mongoose';
import { authService } from '../services/AuthService.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const authController = {
  async register(req, res) {
    const { name, email, password, companyName, industry } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const mockUser = {
        _id: `user-${Date.now()}`,
        name: name || 'Demo User',
        email: email || 'demo@followupos.com',
        role: 'owner',
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

    const result = await authService.register({ name, email, password, companyName, industry });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: result.user,
        organization: result.organization,
        accessToken: result.accessToken,
      },
    });
  },

  async login(req, res) {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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

  async logout(req, res) {
    if (mongoose.connection.readyState === 1 && req.user?._id) {
      try {
        await authService.logout(req.user._id);
      } catch {}
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
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
      sameSite: 'strict',
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
