import mongoose from 'mongoose';

const businessHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  open: { type: String, default: '09:00' },
  close: { type: String, default: '18:00' },
  isOpen: { type: Boolean, default: true },
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  defaultLeadScore: { type: Number, default: 50 },
  defaultFollowUpDelay: { type: Number, default: 24 }, // hours
  businessHours: [businessHoursSchema],
  aiEnabled: { type: Boolean, default: true },
  autoReplyEnabled: { type: Boolean, default: false },
  autoFollowUpEnabled: { type: Boolean, default: true },
  requireHumanApproval: { type: Boolean, default: true },
  defaultTone: {
    type: String,
    enum: ['professional', 'friendly', 'concise', 'consultative', 'persuasive'],
    default: 'professional',
  },
  language: {
    type: String,
    enum: ['english', 'hindi', 'hinglish', 'auto'],
    default: 'english',
  },
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['starter', 'growth', 'agency', 'trial'],
    default: 'trial',
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'trialing'],
    default: 'trialing',
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  currentPeriodEnd: Date,
  trialEndsAt: Date,
  limits: {
    leads: { type: Number, default: 50 }, // per month for trial
    users: { type: Number, default: 1 },
  },
}, { _id: false });

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  industry: {
    type: String,
    enum: [
      'digital_agency', 'web_development', 'marketing_agency',
      'immigration_consulting', 'real_estate', 'recruitment',
      'education_consulting', 'solar_energy', 'interior_design', 'other',
    ],
    default: 'other',
  },
  description: String,
  services: [String],
  website: String,
  phone: String,
  email: String,
  logo: String,
  timezone: { type: String, default: 'Asia/Kolkata' },
  currency: { type: String, default: 'INR' },
  location: String,
  averageDealValue: Number,
  salesCycleLength: String, // e.g., "2 weeks"
  teamSize: Number,
  targetCustomers: String,
  settings: {
    type: settingsSchema,
    default: () => ({}),
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({}),
  },
  onboardingStep: { type: Number, default: 0 },
  onboardingCompleted: { type: Boolean, default: false },
  isDemo: { type: Boolean, default: false },
}, {
  timestamps: true,
});

organizationSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
      '-' + Date.now().toString(36);
  }
  
  // Default business hours
  if (!this.settings.businessHours || this.settings.businessHours.length === 0) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    this.settings.businessHours = days.map((day) => ({
      day,
      open: '09:00',
      close: '18:00',
      isOpen: !['saturday', 'sunday'].includes(day),
    }));
  }
  
  next();
});

export const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
