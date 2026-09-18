import OpenAI from 'openai';
import { AIProvider } from './AIProvider.js';
import {
  LEAD_ANALYSIS_PROMPT,
  REPLY_GENERATION_PROMPT,
  FOLLOWUP_GENERATION_PROMPT,
  CONVERSATION_SUMMARY_PROMPT,
  DAILY_REPORT_PROMPT,
} from './prompts.js';
import { parseAndValidateLeadAnalysis } from './schemas.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000;

export class OpenAIProvider extends AIProvider {
  constructor() {
    super();
    this.name = 'openai';
    if (config.openai.apiKey) {
      this.client = new OpenAI({
        apiKey: config.openai.apiKey,
        timeout: TIMEOUT_MS,
        maxRetries: MAX_RETRIES,
      });
    }
  }

  isAvailable() {
    return !!config.openai.apiKey && !!this.client;
  }

  async _chat(systemPrompt, userContent, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('OpenAI not configured');
    }

    const startTime = Date.now();
    
    const completion = await this.client.chat.completions.create({
      model: options.model || config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
      response_format: options.json ? { type: 'json_object' } : undefined,
    });

    const duration = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    logger.debug('OpenAI call completed', {
      model: config.openai.model,
      tokensUsed,
      durationMs: duration,
    });

    return { content, tokensUsed, durationMs: duration };
  }

  async analyzeLead(context) {
    const { org, services, messages, leadInfo } = context;
    const prompt = LEAD_ANALYSIS_PROMPT(org, services, messages, leadInfo);

    let attempts = 0;
    while (attempts <= MAX_RETRIES) {
      try {
        const { content, tokensUsed, durationMs } = await this._chat(
          'You are a professional sales analyst. Always respond with valid JSON only.',
          prompt,
          { temperature: 0.3, maxTokens: 1200, json: true }
        );

        const result = parseAndValidateLeadAnalysis(content);
        if (result.success) {
          return { ...result.data, tokensUsed, durationMs, source: 'openai' };
        }

        logger.warn('AI analysis validation failed, retrying...', { error: result.error });
        attempts++;
      } catch (error) {
        logger.error('OpenAI analyzeLead error:', error.message);
        attempts++;
        if (attempts > MAX_RETRIES) throw error;
        await new Promise((r) => setTimeout(r, 1000 * attempts));
      }
    }

    // Fallback
    return parseAndValidateLeadAnalysis('{}').fallback;
  }

  async generateReply(context) {
    const { org, lead, contact, messages, tone, instruction } = context;
    const prompt = REPLY_GENERATION_PROMPT(org, lead, contact, messages, tone, instruction);

    const { content } = await this._chat(
      'You are a professional sales representative. Write natural, personalized messages.',
      prompt,
      { temperature: 0.8, maxTokens: 500 }
    );

    return content.trim();
  }

  async generateFollowUp(context) {
    const { org, lead, contact, messages, stepNumber, totalSteps } = context;
    const prompt = FOLLOWUP_GENERATION_PROMPT(org, lead, contact, messages, stepNumber, totalSteps);

    const { content } = await this._chat(
      'You are a professional sales representative writing follow-up messages.',
      prompt,
      { temperature: 0.8, maxTokens: 400 }
    );

    return content.trim();
  }

  async summarizeConversation(messages) {
    const prompt = CONVERSATION_SUMMARY_PROMPT(messages);

    const { content } = await this._chat(
      'You are a sales analyst summarizing customer conversations.',
      prompt,
      { temperature: 0.4, maxTokens: 300 }
    );

    return content.trim();
  }

  async generateDailyReport(data) {
    const prompt = DAILY_REPORT_PROMPT(data);

    const { content } = await this._chat(
      'You are a sales coach generating motivating daily summaries.',
      prompt,
      { temperature: 0.7, maxTokens: 500 }
    );

    return content.trim();
  }

  async generateText(prompt, options = {}) {
    const { content } = await this._chat(
      'You are a helpful AI sales assistant.',
      prompt,
      { temperature: options.temperature ?? 0.7, maxTokens: options.maxTokens ?? 400 }
    );
    return content.trim();
  }
}

export default OpenAIProvider;
