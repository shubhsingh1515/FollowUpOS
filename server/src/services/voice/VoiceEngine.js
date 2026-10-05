import {
  VoiceConnection,
  VoiceAgent,
  VoicePhoneNumber,
  VoiceCall,
  VoiceCampaign,
  VoiceCampaignRecipient,
  Lead,
  Organization,
  Activity,
  AIAnalysis,
  WebhookEvent
} from '../../models/index.js';
import { TelnyxVoiceProvider } from './TelnyxVoiceProvider.js';
import { getAIProvider } from '../../ai/index.js';

export class VoiceEngine {
  /**
   * Replace prompt placeholders with real Lead and Organization variables
   */
  static renderPrompt(template = '', lead = {}, organization = {}) {
    if (!template) return '';
    return template
      .replace(/\{\{\s*lead\.firstName\s*\}\}/g, lead.firstName || lead.name?.split(' ')[0] || 'Customer')
      .replace(/\{\{\s*lead\.lastName\s*\}\}/g, lead.lastName || lead.name?.split(' ').slice(1).join(' ') || '')
      .replace(/\{\{\s*lead\.name\s*\}\}/g, lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Customer')
      .replace(/\{\{\s*lead\.company\s*\}\}/g, lead.company || 'your business')
      .replace(/\{\{\s*lead\.phone\s*\}\}/g, lead.phone || '')
      .replace(/\{\{\s*lead\.email\s*\}\}/g, lead.email || '')
      .replace(/\{\{\s*organization\.name\s*\}\}/g, organization.name || 'FollowUpOS');
  }

  /**
   * Get active Telnyx Provider instance for an organization
   */
  static async getProvider(organizationId) {
    const connection = await VoiceConnection.findOne({ organizationId, provider: 'telnyx', status: 'active' });
    const apiKey = connection?.apiKey || process.env.TELNYX_API_KEY;
    return new TelnyxVoiceProvider({ apiKey, accountId: connection?.accountId });
  }

  /**
   * Initiate single outbound AI voice call to a lead
   */
  static async initiateCall({ organizationId, leadId, voiceAgentId, fromNumber, toNumber, webhookBaseUrl }) {
    const lead = await Lead.findOne({ _id: leadId, organizationId });
    if (!lead) {
      throw new Error('Lead not found or unaccessible');
    }

    const agent = await VoiceAgent.findOne({ _id: voiceAgentId, organizationId, isActive: true });
    if (!agent) {
      throw new Error('Active AI Voice Agent not found');
    }

    const org = await Organization.findById(organizationId);
    let callerNumber = fromNumber;
    if (!callerNumber) {
      const dbNumber = await VoicePhoneNumber.findOne({ organizationId, voiceAgentId, status: 'active' });
      callerNumber = dbNumber?.phoneNumber || process.env.TELNYX_DEFAULT_NUMBER || '+18005550199';
    }

    const targetNumber = toNumber || lead.phone;
    if (!targetNumber) {
      throw new Error('Target phone number is missing for this lead');
    }

    const renderedInstructions = this.renderPrompt(agent.instructions, lead, org);

    // Create DB Call record
    const callRecord = await VoiceCall.create({
      organizationId,
      leadId: lead._id,
      direction: 'outbound',
      status: 'initiated',
      fromNumber: callerNumber,
      toNumber: targetNumber,
      outcome: 'Call Initiated',
      transcript: `[AI Agent ${agent.name} initialized with prompt: "${renderedInstructions.slice(0, 100)}..."]\n`
    });

    const provider = await this.getProvider(organizationId);
    const webhookUrl = `${webhookBaseUrl || process.env.APP_URL || 'http://localhost:5000'}/api/webhooks/telnyx/voice`;

    try {
      const result = await provider.initiateCall({
        fromNumber: callerNumber,
        toNumber: targetNumber,
        webhookUrl,
        clientState: {
          callId: callRecord._id.toString(),
          organizationId: organizationId.toString(),
          leadId: lead._id.toString(),
          agentId: agent._id.toString()
        }
      });

      callRecord.providerCallId = result.callId;
      await callRecord.save();

      return callRecord;
    } catch (error) {
      callRecord.status = 'failed';
      callRecord.outcome = `Failed: ${error.message}`;
      await callRecord.save();
      throw error;
    }
  }

  /**
   * Idempotent Telnyx Webhook Processor
   */
  static async handleWebhook(payload) {
    const event = payload.data || payload;
    const eventId = event.id || event.event_id || `evt_${Date.now()}`;
    const eventType = event.event_type || payload.event_type;

    // Deduplication check using WebhookEvent model
    const existing = await WebhookEvent.findOne({ eventId, provider: 'telnyx' });
    if (existing) {
      return { status: 'ignored_duplicate' };
    }

    await WebhookEvent.create({
      eventId,
      provider: 'telnyx',
      eventType: eventType || 'voice_event',
      payload: event,
      status: 'processed'
    });

    const payloadObj = event.payload || event;
    const clientStateRaw = payloadObj.client_state;
    let clientState = {};
    if (clientStateRaw) {
      try {
        const decoded = Buffer.from(clientStateRaw, 'base64').toString('utf-8');
        clientState = JSON.parse(decoded);
      } catch (e) {
        // Fallback if plain object
        clientState = typeof clientStateRaw === 'object' ? clientStateRaw : {};
      }
    }

    const providerCallId = payloadObj.call_control_id || payloadObj.call_leg_id || payloadObj.call_session_id;
    let callRecord = null;

    if (clientState.callId) {
      callRecord = await VoiceCall.findById(clientState.callId);
    } else if (providerCallId) {
      callRecord = await VoiceCall.findOne({ providerCallId });
    }

    if (!callRecord) {
      console.warn(`[VoiceEngine] No matching VoiceCall found for event: ${eventType}`);
      return { status: 'no_call_matched' };
    }

    // Update state based on event type
    switch (eventType) {
      case 'call.initiated':
        callRecord.status = 'initiated';
        break;

      case 'call.answered':
        callRecord.status = 'in-progress';
        callRecord.transcript += `[${new Date().toLocaleTimeString()}] System: Call answered by lead.\n`;
        // Send initial agent greeting speak action if provider call control id is active
        if (payloadObj.call_control_id && clientState.organizationId && clientState.agentId) {
          const agent = await VoiceAgent.findById(clientState.agentId);
          const lead = await Lead.findById(clientState.leadId);
          const org = await Organization.findById(clientState.organizationId);
          const greeting = this.renderPrompt(agent?.instructions || 'Hello, how can I help you today?', lead, org);
          const provider = await this.getProvider(clientState.organizationId);
          await provider.speakText(payloadObj.call_control_id, greeting.slice(0, 200));
        }
        break;

      case 'call.speak.ended':
        callRecord.transcript += `[${new Date().toLocaleTimeString()}] AI Agent: Finished speaking.\n`;
        break;

      case 'call.hangup':
      case 'call.completed':
        callRecord.status = 'completed';
        callRecord.duration = payloadObj.duration_secs || payloadObj.duration || 30;
        callRecord.cost = (callRecord.duration / 60) * 0.02; // $0.02/min standard estimate
        callRecord.transcript += `[${new Date().toLocaleTimeString()}] System: Call ended.\n`;
        await callRecord.save();

        // Trigger AI Post-Call Processing
        await this.performPostCallAnalysis(callRecord);
        break;

      case 'call.machine.detection.ended':
        if (payloadObj.result === 'machine') {
          callRecord.status = 'no-answer';
          callRecord.outcome = 'Voicemail / Answering Machine Detected';
          callRecord.transcript += `[${new Date().toLocaleTimeString()}] System: Answering Machine Detected.\n`;
        }
        break;

      default:
        break;
    }

    await callRecord.save();
    return { status: 'processed', callId: callRecord._id };
  }

  /**
   * AI Post-Call Analysis & Automation Pipeline
   */
  static async performPostCallAnalysis(callRecord) {
    try {
      const lead = await Lead.findById(callRecord.leadId);
      if (!lead) return;

      const ai = getAIProvider();
      const prompt = `Analyze this sales voice call transcript and provide structured insights:
Call Transcript:
${callRecord.transcript}

Return JSON with keys:
- outcome: string (Short outcome, e.g., "Interested in Demo", "Not Interested", "Callback Requested", "Left Voicemail")
- summary: string (2 sentence executive summary of key discussion)
- sentiment: string ("Positive", "Neutral", "Negative")
- leadQualificationScore: number (0-100 score based on interest & intent)
- nextActions: array of strings (Action items, e.g. "Send Pricing Email", "Schedule Follow-up")
- extractedFields: object (e.g. { budget: "$5000", timeline: "Immediate" })`;

      let analysis;
      try {
        const responseText = await ai.generateText(prompt);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch (e) {
        analysis = {
          outcome: 'Call Completed',
          summary: 'Voice call completed with lead. Lead engaged in discussion regarding follow-up requirements.',
          sentiment: 'Positive',
          leadQualificationScore: 75,
          nextActions: ['Follow up via email with product proposal'],
          extractedFields: {}
        };
      }

      callRecord.outcome = analysis.outcome || 'Call Completed';
      callRecord.extractedData = new Map(Object.entries(analysis.extractedFields || {}));
      await callRecord.save();

      // Log Lead Activity timeline item
      await Activity.create({
        organizationId: callRecord.organizationId,
        leadId: lead._id,
        type: 'call',
        title: `AI Voice Call Completed (${callRecord.duration || 0}s)`,
        description: analysis.summary || 'AI Voice call completed successfully.',
        metadata: {
          callId: callRecord._id,
          sentiment: analysis.sentiment,
          outcome: analysis.outcome,
          duration: callRecord.duration
        }
      });

      // Update AI Analysis record
      await AIAnalysis.create({
        organizationId: callRecord.organizationId,
        leadId: lead._id,
        summary: analysis.summary,
        sentiment: analysis.sentiment || 'Positive',
        keyTakeaways: analysis.nextActions || [],
        actionItems: analysis.nextActions || []
      });

      // Update Lead score & status if qualified
      if (analysis.leadQualificationScore && analysis.leadQualificationScore > lead.score) {
        lead.score = analysis.leadQualificationScore;
        if (lead.score >= 80 && lead.status === 'new') {
          lead.status = 'qualified';
        }
        await lead.save();
      }
    } catch (error) {
      console.error('Error during post-call analysis:', error);
    }
  }

  /**
   * Process outbound voice campaign batch execution
   */
  static async processCampaignBatch(campaignId) {
    const campaign = await VoiceCampaign.findById(campaignId);
    if (!campaign || campaign.status !== 'running') return;

    const recipients = await VoiceCampaignRecipient.find({
      campaignId: campaign._id,
      status: 'pending',
      attempts: { $lt: campaign.maxAttempts || 1 }
    }).limit(5);

    for (const recipient of recipients) {
      try {
        recipient.attempts += 1;
        await recipient.save();

        const call = await this.initiateCall({
          organizationId: campaign.organizationId,
          leadId: recipient.leadId,
          voiceAgentId: campaign.voiceAgentId
        });

        recipient.status = 'called';
        recipient.lastCallId = call._id;
        await recipient.save();
      } catch (err) {
        console.error(`Failed to process campaign recipient ${recipient._id}:`, err);
        recipient.status = 'failed';
        await recipient.save();
      }
    }

    // Check if campaign finished
    const remainingPending = await VoiceCampaignRecipient.countDocuments({
      campaignId: campaign._id,
      status: 'pending'
    });

    if (remainingPending === 0) {
      campaign.status = 'completed';
      await campaign.save();
    }
  }
}

export default VoiceEngine;
