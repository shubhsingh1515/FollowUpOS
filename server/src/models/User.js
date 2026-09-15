import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  googleId: {
    type: String,
    sparse: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: function () {
      return this.authProvider === 'local';
    },
    select: false,
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'sales_rep', 'viewer'],
    default: 'owner',
  },
  platformRole: {
    type: String,
    enum: ['none', 'super_admin', 'support_admin', 'billing_admin'],
    default: 'none',
    index: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  },
  refreshToken: {
    type: String,
    select: false,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerifiedAt: {
    type: Date,
    default: null,
  },
  emailVerificationTokenHash: {
    type: String,
    select: false,
  },
  emailVerificationExpiresAt: {
    type: Date,
    select: false,
  },
  lastVerificationResendAt: {
    type: Date,
    default: null,
  },
  verificationResendCount: {
    type: Number,
    default: 0,
  },
  passwordResetTokenHash: {
    type: String,
    select: false,
  },
  passwordResetExpiresAt: {
    type: Date,
    select: false,
  },
  lastLoginAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpiresAt;
  delete obj.emailVerificationTokenHash;
  delete obj.emailVerificationExpiresAt;
  delete obj.__v;
  return obj;
};

userSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 12);
};

export const User = mongoose.model('User', userSchema);
export default User;
