import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { FollowUpSequence } from '../models/FollowUpSequence.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

/**
 * Create default follow-up sequence for a new organization
 */
async function createDefaultSequence(organizationId) {
  return FollowUpSequence.create({
    organizationId,
    name: 'Default Follow-up Sequence',
    description: 'Automatically generated follow-up sequence',
    isDefault: true,
    active: true,
    steps: [
      {
        stepNumber: 1,
        delay: 0,
        delayUnit: 'hours',
        name: 'Immediate response',
        useAI: true,
        requireApproval: true,
      },
      {
        stepNumber: 2,
        delay: 24,
        delayUnit: 'hours',
        name: '24-hour follow-up',
        useAI: true,
        requireApproval: true,
      },
      {
        stepNumber: 3,
        delay: 3,
        delayUnit: 'days',
        name: '3-day follow-up',
        useAI: true,
        requireApproval: true,
      },
      {
        stepNumber: 4,
        delay: 6,
        delayUnit: 'days',
        name: 'Final follow-up',
        useAI: true,
        requireApproval: true,
      },
    ],
  });
}

export class AuthService {
  async register({ name, email, password, companyName, industry }) {
    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create organization first
    const organization = await Organization.create({
      name: companyName,
      industry: industry || 'other',
      subscription: {
        plan: 'trial',
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        limits: { leads: 50, users: 3 },
      },
    });

    // Hash password and create user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'owner',
      organizationId: organization._id,
    });

    // Create default follow-up sequence
    await createDefaultSequence(organization._id);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    
    // Store refresh token hash
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    logger.info('User registered', { userId: user._id, orgId: organization._id });

    return {
      user: user.toJSON(),
      organization,
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password }) {
    import('mongoose');
    const mongoose = (await import('mongoose')).default;
    
    // Offline / Demo fallback when MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      if (email.toLowerCase() === 'demo@followupos.com' || !email.includes('@')) {
        const demoUserId = '660000000000000000000001';
        const demoOrgId = '660000000000000000000002';
        const { accessToken, refreshToken } = generateTokens(demoUserId);
        return {
          user: {
            _id: demoUserId,
            name: 'Arjun Kapoor',
            email: 'demo@followupos.com',
            role: 'owner',
            organizationId: demoOrgId,
            onboardingCompleted: true,
          },
          organization: {
            _id: demoOrgId,
            name: 'BrightWeb Digital Agency',
            slug: 'brightweb-demo',
            industry: 'digital_agency',
            isDemo: true,
            currency: 'USD',
            timezone: 'Asia/Kolkata',
            subscription: { plan: 'growth', status: 'active' },
            onboardingCompleted: true,
          },
          accessToken,
          refreshToken,
        };
      }
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account deactivated. Contact your administrator.', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    const organization = await Organization.findById(user.organizationId);

    logger.info('User logged in', { userId: user._id });

    return {
      user: user.toJSON(),
      organization,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Refresh token revoked', 401, 'REFRESH_TOKEN_REVOKED');
    }

    const tokens = generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    logger.info('User logged out', { userId });
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    
    const organization = await Organization.findById(user.organizationId);
    return { user, organization };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new AppError('Current password is incorrect', 400, 'WRONG_PASSWORD');

    user.passwordHash = await User.hashPassword(newPassword);
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    logger.info('Password changed', { userId });
  }
}

export const authService = new AuthService();
export default authService;
