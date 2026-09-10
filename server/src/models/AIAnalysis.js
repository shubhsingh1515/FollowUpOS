import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['lead_analysis', 'lead_scoring', 'reply_generation', 'followup_generation', 'conversation_summary', 'daily_report'],
    required: true,
  },
  input: {
    type: String,
    maxlength: 10000,
  },
  output: mongoose.Schema.Types.Mixed,
  model: { type: String, default: 'gpt-4o-mini' },
  tokensUsed: Number,
  durationMs: Number,
  success: { type: Boolean, default: true },
  error: String,
}, {
  timestamps: true,
});

aiAnalysisSchema.index({ leadId: 1, createdAt: -1 });

export const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);
export default AIAnalysis;
