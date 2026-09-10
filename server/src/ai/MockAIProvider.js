import { AIProvider } from './AIProvider.js';
import { logger } from '../utils/logger.js';

/**
 * Mock AI Provider for demo mode when OpenAI credentials are not available.
 * Returns realistic-looking pre-defined responses.
 */
export class MockAIProvider extends AIProvider {
  constructor() {
    super();
    this.name = 'mock';
  }

  isAvailable() {
    return true;
  }

  async analyzeLead(context) {
    const { messages, leadInfo } = context;
    logger.debug('MockAIProvider: analyzeLead called');

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 300));

    const content = messages.map((m) => m.content).join(' ').toLowerCase();
    
    // Heuristic scoring based on keywords
    let score = 45;
    let temperature = 'cold';
    let intent = 'inquiry';
    let intentConfidence = 0.4;
    
    if (content.includes('urgent') || content.includes('asap') || content.includes('immediately')) {
      score += 25;
      intentConfidence = 0.9;
    }
    if (content.includes('budget') || content.includes('price') || content.includes('cost') || content.includes('quote')) {
      score += 15;
      intent = 'purchase';
      intentConfidence = Math.max(intentConfidence, 0.7);
    }
    if (content.includes('next month') || content.includes('this week') || content.includes('soon')) {
      score += 10;
    }
    if (content.includes('website') || content.includes('app') || content.includes('marketing')) {
      score += 5;
    }
    if (content.includes('just looking') || content.includes('not sure') || content.includes('maybe')) {
      score -= 15;
    }
    
    score = Math.min(100, Math.max(0, score));
    
    if (score >= 70) temperature = 'hot';
    else if (score >= 45) temperature = 'warm';

    const budgetMatch = content.match(/(\d[\d,]*)\s*(k|lakh|thousand|l)/i);
    let budgetMin = null;
    let budgetMax = null;
    
    if (budgetMatch) {
      const num = parseInt(budgetMatch[1].replace(/,/g, ''));
      const unit = budgetMatch[2].toLowerCase();
      let value = num;
      if (unit === 'k') value = num * 1000;
      if (unit === 'lakh' || unit === 'l') value = num * 100000;
      budgetMin = Math.round(value * 0.8);
      budgetMax = Math.round(value * 1.2);
    }

    return {
      score,
      temperature,
      intent,
      intentConfidence,
      industry: leadInfo?.company ? 'business' : null,
      service: this._detectService(content),
      budget: {
        min: budgetMin,
        max: budgetMax,
        currency: 'INR',
      },
      timeline: this._detectTimeline(content),
      summary: `${leadInfo?.name || 'The lead'} is interested in ${this._detectService(content)} services. ${score >= 70 ? 'Shows strong purchase intent.' : 'In early inquiry stage.'}`,
      insights: [
        score >= 70 ? 'High purchase intent detected' : 'Early-stage inquiry',
        budgetMin ? `Budget range estimated: ₹${budgetMin.toLocaleString()} - ₹${budgetMax?.toLocaleString()}` : 'Budget not mentioned',
        'Follow up within 24 hours for best results',
      ],
      recommendedAction: score >= 70
        ? 'Send a proposal or detailed quote immediately'
        : 'Qualify the lead with specific questions about requirements and budget',
      nextFollowUpHours: score >= 70 ? 12 : 24,
      source: 'mock',
    };
  }

  _detectService(content) {
    if (content.includes('website') || content.includes('web')) return 'Website Development';
    if (content.includes('app') || content.includes('mobile')) return 'App Development';
    if (content.includes('seo') || content.includes('search')) return 'SEO';
    if (content.includes('social media') || content.includes('instagram')) return 'Social Media Marketing';
    if (content.includes('google ads') || content.includes('ppc')) return 'Google Ads';
    if (content.includes('branding') || content.includes('logo')) return 'Branding';
    if (content.includes('solar') || content.includes('energy')) return 'Solar Installation';
    if (content.includes('interior') || content.includes('design')) return 'Interior Design';
    return 'General Services';
  }

  _detectTimeline(content) {
    if (content.includes('urgent') || content.includes('asap')) return 'Urgent';
    if (content.includes('this week')) return '1 week';
    if (content.includes('next week')) return '1-2 weeks';
    if (content.includes('this month') || content.includes('next month')) return '1 month';
    if (content.includes('3 months') || content.includes('quarter')) return '3 months';
    return null;
  }

  async generateReply(context) {
    const { lead, contact, messages, tone } = context;
    logger.debug('MockAIProvider: generateReply called');
    await new Promise((r) => setTimeout(r, 400));

    const name = contact?.fullName?.split(' ')[0] || 'there';
    const service = lead?.service || 'your requirements';
    const lastMessage = messages[messages.length - 1]?.content || '';

    const replies = [
      `Hi ${name}, thanks for reaching out! We'd love to help with ${service}. Could you share a bit more about your specific requirements and timeline? That will help me give you the most accurate recommendation.`,
      `Hi ${name}, absolutely — we specialize in exactly this. Let me understand your needs better: what's your primary goal with ${service}, and do you have a timeline in mind? I can share some relevant examples once we align on the scope.`,
      `Hi ${name}, great to hear from you! ${service} is something we do really well for businesses like yours. To give you a proper quote and timeline, could you tell me a little more about the scale of the project and when you'd like to get started?`,
    ];

    return replies[Math.floor(Math.random() * replies.length)];
  }

  async generateFollowUp(context) {
    const { lead, contact, stepNumber } = context;
    logger.debug('MockAIProvider: generateFollowUp called');
    await new Promise((r) => setTimeout(r, 300));

    const name = contact?.fullName?.split(' ')[0] || 'there';
    const service = lead?.service || 'your project';

    const followUps = [
      `Hi ${name}, just checking in to see if you had a chance to think about ${service}. Happy to answer any questions or share examples — no pressure at all.`,
      `Hi ${name}, wanted to follow up on ${service}. We've recently worked with a similar business and got great results. Would it be helpful to share that case study?`,
      `Hi ${name}, I'll keep this brief — if ${service} is still on your radar, I'm here to help whenever you're ready. Feel free to reach out anytime.`,
    ];

    const idx = Math.min(stepNumber - 1, followUps.length - 1);
    return followUps[idx];
  }

  async summarizeConversation(messages) {
    await new Promise((r) => setTimeout(r, 200));
    const total = messages.length;
    const inbound = messages.filter((m) => m.direction === 'inbound').length;
    return `Conversation with ${total} messages (${inbound} from customer). Customer appears to be interested in the company's services. Follow-up recommended.`;
  }

  async generateDailyReport(data) {
    await new Promise((r) => setTimeout(r, 200));
    return `Good morning 👋

Your sales summary:

🔥 ${data.hotLeads} hot leads need your attention today
💰 ${data.currency} ${(data.pipelineValue || 0).toLocaleString()} in active pipeline
📩 ${data.needsFollowUp} leads are waiting for follow-up
📅 ${data.meetingsToday} meetings scheduled today
🎉 ${data.dealsWon} deals won recently

Stay focused and close those deals! Your team is counting on you. 💪`;
  }
}

export default MockAIProvider;
