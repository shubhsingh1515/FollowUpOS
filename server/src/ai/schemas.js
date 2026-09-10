import { z } from 'zod';

export const leadAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  temperature: z.enum(['hot', 'warm', 'cold']),
  intent: z.enum(['purchase', 'inquiry', 'research', 'comparison', 'support', 'unknown']),
  intentConfidence: z.number().min(0).max(1),
  industry: z.string().nullable().optional(),
  service: z.string().optional().default(''),
  budget: z.object({
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    currency: z.string().default('INR'),
  }).optional().default({}),
  timeline: z.string().nullable().optional(),
  summary: z.string(),
  insights: z.array(z.string()).optional().default([]),
  recommendedAction: z.string(),
  nextFollowUpHours: z.number().min(1).max(720).default(24),
  companySize: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export function parseAndValidateLeadAnalysis(rawJson) {
  try {
    // Clean up common AI JSON issues
    let cleaned = rawJson.trim();
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
    
    const parsed = JSON.parse(cleaned);
    const validated = leadAnalysisSchema.parse(parsed);
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: {
        score: 30,
        temperature: 'cold',
        intent: 'inquiry',
        intentConfidence: 0.3,
        summary: 'AI analysis could not be completed. Manual review required.',
        insights: [],
        recommendedAction: 'Review lead manually and follow up within 24 hours.',
        nextFollowUpHours: 24,
        budget: { currency: 'INR' },
      },
    };
  }
}
