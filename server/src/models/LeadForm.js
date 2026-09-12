import mongoose from 'mongoose';

const formFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'email', 'phone', 'select', 'textarea', 'number', 'budget'],
    default: 'text'
  },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: [{ type: String }]
});

const leadFormSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Website Contact Form'
  },
  publicId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'Get a Consultation'
  },
  subtitle: {
    type: String,
    default: 'Tell us about your project and we will respond within 2 minutes.'
  },
  buttonText: {
    type: String,
    default: 'Submit Request'
  },
  primaryColor: {
    type: String,
    default: '#4F46E5'
  },
  fields: [formFieldSchema],
  honeypotField: {
    type: String,
    default: 'website_url_hp'
  },
  successMessage: {
    type: String,
    default: 'Thank you! Our AI sales copilot has received your request and an agent is following up.'
  },
  redirectUrl: {
    type: String,
    default: ''
  },
  submissionsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

leadFormSchema.index({ organizationId: 1, createdAt: -1 });

export const LeadForm = mongoose.model('LeadForm', leadFormSchema);
export default LeadForm;
