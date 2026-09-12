import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'ADMIN_LOGIN',
      'ORGANIZATION_VIEW',
      'ORGANIZATION_SUSPEND',
      'ORGANIZATION_REACTIVATE',
      'PLAN_CHANGE_MANUAL',
      'TRIAL_EXTENSION',
      'IMPERSONATION_START',
      'FEATURE_FLAG_UPDATE',
      'SUPPORT_TICKET_REPLY',
      'USAGE_QUOTA_RESET',
      'INTEGRATION_RETRY'
    ],
    index: true
  },
  targetOrgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  userAgent: String,
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ adminId: 1, action: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
