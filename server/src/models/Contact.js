import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  fullName: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true, index: true },
  company: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  location: { type: String, trim: true },
  website: String,
  avatar: String,
  socialProfiles: {
    linkedin: String,
    facebook: String,
    instagram: String,
    twitter: String,
    whatsapp: String,
  },
  tags: [{ type: String, trim: true }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  source: {
    type: String,
    enum: ['website', 'whatsapp', 'instagram', 'facebook', 'linkedin', 'email', 'google_forms', 'calendly', 'manual', 'csv', 'other'],
    default: 'manual',
  },
  notes: String,
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Compound index for organization-level searches
contactSchema.index({ organizationId: 1, email: 1 });
contactSchema.index({ organizationId: 1, phone: 1 });
contactSchema.index({ organizationId: 1, createdAt: -1 });

// Auto-populate fullName
contactSchema.pre('save', function (next) {
  if (!this.fullName && (this.firstName || this.lastName)) {
    this.fullName = [this.firstName, this.lastName].filter(Boolean).join(' ');
  }
  next();
});

export const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
