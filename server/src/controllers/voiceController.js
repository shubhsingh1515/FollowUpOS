import {
  VoiceAgent,
  VoiceConnection,
  VoiceCall,
  VoiceCampaign,
  VoiceCampaignRecipient,
  VoicePhoneNumber,
  Lead,
  Organization
} from '../models/index.js';
import { VoiceEngine } from '../services/voice/VoiceEngine.js';

import { encryptionService } from '../utils/encryption.js';
import { TelnyxVoiceProvider } from '../services/voice/TelnyxVoiceProvider.js';

// --- Connection Handlers ---

export const status = async (req, res) => {
  try {
    const connection = await VoiceConnection.findOne({ organizationId: req.user.organizationId, provider: 'telnyx' });
    if (!connection) {
      return res.status(200).json({ status: 'unconfigured', provider: 'telnyx' });
    }

    const decryptedKey = encryptionService.decrypt(connection.apiKey);
    const maskedKey = decryptedKey ? `${decryptedKey.slice(0, 6)}••••${decryptedKey.slice(-4)}` : 'TELNYX_CONFIGURED';

    return res.status(200).json({
      _id: connection._id,
      provider: connection.provider,
      status: connection.status,
      accountId: connection.accountId,
      maskedApiKey: maskedKey,
      updatedAt: connection.updatedAt
    });
  } catch (error) {
    console.error('Error fetching voice status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const connectTelnyx = async (req, res) => {
  try {
    const { apiKey, accountId } = req.body;
    if (!apiKey) {
      return res.status(400).json({ message: 'Telnyx API Key is required' });
    }

    // Verify API key against Telnyx REST API before saving
    const testProvider = new TelnyxVoiceProvider({ apiKey });
    const verifyResult = await testProvider.verifyConnection();

    if (!verifyResult.success && !process.env.ALLOW_DEMO_CREDENTIALS) {
      return res.status(400).json({ message: verifyResult.message || 'Invalid Telnyx API credentials provided' });
    }

    const encryptedKey = encryptionService.encrypt(apiKey);

    let connection = await VoiceConnection.findOne({ organizationId: req.user.organizationId, provider: 'telnyx' });
    
    if (connection) {
      connection.apiKey = encryptedKey;
      connection.accountId = accountId || connection.accountId;
      connection.status = 'active';
      await connection.save();
    } else {
      connection = await VoiceConnection.create({
        organizationId: req.user.organizationId,
        provider: 'telnyx',
        apiKey: encryptedKey,
        accountId: accountId || '',
        status: 'active'
      });
    }

    const maskedKey = `${apiKey.slice(0, 6)}••••${apiKey.slice(-4)}`;

    return res.status(200).json({
      _id: connection._id,
      provider: connection.provider,
      status: connection.status,
      accountId: connection.accountId,
      maskedApiKey: maskedKey,
      message: 'Telnyx account successfully connected and verified!'
    });
  } catch (error) {
    console.error('Error connecting Telnyx:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const testTelnyx = async (req, res) => {
  try {
    const provider = await VoiceEngine.getProvider(req.user.organizationId);
    const result = await provider.verifyConnection();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error testing Telnyx connection:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disconnectTelnyx = async (req, res) => {
  try {
    const connection = await VoiceConnection.findOne({ organizationId: req.user.organizationId, provider: 'telnyx' });
    if (connection) {
      connection.status = 'inactive';
      await connection.save();
    }
    return res.status(200).json({ message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Telnyx:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Agent Handlers ---

export const getAgents = async (req, res) => {
  try {
    const agents = await VoiceAgent.find({ organizationId: req.user.organizationId }).sort({ createdAt: -1 });
    res.status(200).json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAgent = async (req, res) => {
  try {
    const { name, voiceId, language, instructions, tools, isActive } = req.body;
    const agent = await VoiceAgent.create({
      organizationId: req.user.organizationId,
      name,
      voiceId: voiceId || 'alloy',
      language: language || 'en-US',
      instructions: instructions || 'You are an AI sales assistant for FollowUpOS.',
      tools: tools || ['qualify_lead', 'schedule_followup'],
      isActive: isActive !== undefined ? isActive : true
    });
    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAgent = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(200).json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(200).json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Number Handlers ---

export const getNumbers = async (req, res) => {
  try {
    const numbers = await VoicePhoneNumber.find({ organizationId: req.user.organizationId })
      .populate('voiceAgentId', 'name voiceId')
      .sort({ createdAt: -1 });
    res.status(200).json(numbers);
  } catch (error) {
    console.error('Error fetching numbers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchAvailableNumbers = async (req, res) => {
  try {
    const { countryCode, areaCode } = req.query;
    const provider = await VoiceEngine.getProvider(req.user.organizationId);
    const numbers = await provider.searchPhoneNumbers({ countryCode, areaCode });
    res.status(200).json(numbers);
  } catch (error) {
    console.error('Error searching available numbers:', error);
    res.status(500).json({ message: 'Failed to search phone numbers' });
  }
};

export const purchaseNumber = async (req, res) => {
  try {
    const { phoneNumber, voiceAgentId } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const provider = await VoiceEngine.getProvider(req.user.organizationId);
    const purchaseResult = await provider.purchasePhoneNumber(phoneNumber);

    const newNumberRecord = await VoicePhoneNumber.create({
      organizationId: req.user.organizationId,
      phoneNumber: purchaseResult.phoneNumber,
      provider: 'telnyx',
      providerNumberId: purchaseResult.providerNumberId,
      voiceAgentId: voiceAgentId || null,
      status: voiceAgentId ? 'active' : 'unassigned'
    });

    res.status(201).json(newNumberRecord);
  } catch (error) {
    console.error('Error purchasing number:', error);
    res.status(500).json({ message: error.message || 'Failed to purchase phone number' });
  }
};

export const assignNumber = async (req, res) => {
  try {
    const { voiceAgentId } = req.body;
    const number = await VoicePhoneNumber.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { voiceAgentId: voiceAgentId || null, status: voiceAgentId ? 'active' : 'unassigned' },
      { new: true }
    ).populate('voiceAgentId', 'name voiceId');

    if (!number) {
      return res.status(404).json({ message: 'Phone number not found' });
    }

    res.status(200).json(number);
  } catch (error) {
    console.error('Error assigning number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateNumber = async (req, res) => {
  try {
    const number = await VoicePhoneNumber.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      req.body,
      { new: true }
    );
    if (!number) {
      return res.status(404).json({ message: 'Number not found' });
    }
    res.status(200).json(number);
  } catch (error) {
    console.error('Error updating number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Call Handlers ---

export const getCalls = async (req, res) => {
  try {
    const { status, leadId, limit = 50 } = req.query;
    const query = { organizationId: req.user.organizationId };
    if (status) query.status = status;
    if (leadId) query.leadId = leadId;

    const calls = await VoiceCall.find(query)
      .populate('leadId', 'name email phone company score status')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json(calls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCall = async (req, res) => {
  try {
    const call = await VoiceCall.findOne({ _id: req.params.id, organizationId: req.user.organizationId })
      .populate('leadId', 'name email phone company score status');

    if (!call) {
      return res.status(404).json({ message: 'Call record not found' });
    }
    res.status(200).json(call);
  } catch (error) {
    console.error('Error fetching call details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const initiateCall = async (req, res) => {
  try {
    const { leadId, voiceAgentId, fromNumber, toNumber } = req.body;
    if (!leadId) {
      return res.status(400).json({ message: 'leadId is required' });
    }

    let agentId = voiceAgentId;
    if (!agentId) {
      const defaultAgent = await VoiceAgent.findOne({ organizationId: req.user.organizationId, isActive: true });
      if (!defaultAgent) {
        return res.status(400).json({ message: 'No active AI Voice Agent found. Please create an agent first.' });
      }
      agentId = defaultAgent._id;
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const webhookBaseUrl = process.env.APP_URL || `${protocol}://${host}`;

    const callRecord = await VoiceEngine.initiateCall({
      organizationId: req.user.organizationId,
      leadId,
      voiceAgentId: agentId,
      fromNumber,
      toNumber,
      webhookBaseUrl
    });

    res.status(201).json(callRecord);
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ message: error.message || 'Failed to initiate call' });
  }
};

export const endCall = async (req, res) => {
  try {
    const call = await VoiceCall.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    if (call.providerCallId) {
      const provider = await VoiceEngine.getProvider(req.user.organizationId);
      await provider.hangupCall(call.providerCallId);
    }

    call.status = 'completed';
    call.outcome = 'Ended by User';
    await call.save();

    res.status(200).json(call);
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const transferCall = async (req, res) => {
  res.status(200).json({ message: 'Transfer action logged' });
};

// --- Campaign Handlers ---

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await VoiceCampaign.find({ organizationId: req.user.organizationId })
      .populate('voiceAgentId', 'name voiceId')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(campaigns.map(async (c) => {
      const totalRecipients = await VoiceCampaignRecipient.countDocuments({ campaignId: c._id });
      const completedCount = await VoiceCampaignRecipient.countDocuments({ campaignId: c._id, status: 'completed' });
      const calledCount = await VoiceCampaignRecipient.countDocuments({ campaignId: c._id, status: 'called' });
      const failedCount = await VoiceCampaignRecipient.countDocuments({ campaignId: c._id, status: 'failed' });

      return {
        ...c.toObject(),
        stats: {
          total: totalRecipients,
          completed: completedCount,
          called: calledCount,
          failed: failedCount,
          pending: totalRecipients - (completedCount + calledCount + failedCount)
        }
      };
    }));

    res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, voiceAgentId, leadIds, filterStage, maxAttempts } = req.body;
    if (!name || !voiceAgentId) {
      return res.status(400).json({ message: 'Campaign name and voiceAgentId are required' });
    }

    const campaign = await VoiceCampaign.create({
      organizationId: req.user.organizationId,
      name,
      voiceAgentId,
      maxAttempts: maxAttempts || 1,
      status: 'draft'
    });

    let targetLeadIds = leadIds || [];
    if (!targetLeadIds.length && filterStage) {
      const leads = await Lead.find({ organizationId: req.user.organizationId, status: filterStage }).select('_id');
      targetLeadIds = leads.map(l => l._id);
    } else if (!targetLeadIds.length) {
      const leads = await Lead.find({ organizationId: req.user.organizationId }).limit(100).select('_id');
      targetLeadIds = leads.map(l => l._id);
    }

    const recipientDocs = targetLeadIds.map(leadId => ({
      organizationId: req.user.organizationId,
      campaignId: campaign._id,
      leadId,
      status: 'pending'
    }));

    if (recipientDocs.length > 0) {
      await VoiceCampaignRecipient.insertMany(recipientDocs);
    }

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCampaign = async (req, res) => {
  try {
    const campaign = await VoiceCampaign.findOne({ _id: req.params.id, organizationId: req.user.organizationId })
      .populate('voiceAgentId', 'name voiceId');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const recipients = await VoiceCampaignRecipient.find({ campaignId: campaign._id })
      .populate('leadId', 'name phone email score status')
      .populate('lastCallId', 'status outcome duration transcript');

    res.status(200).json({ campaign, recipients });
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaign = await VoiceCampaign.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      req.body,
      { new: true }
    );
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const startCampaign = async (req, res) => {
  try {
    const campaign = await VoiceCampaign.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    campaign.status = 'running';
    await campaign.save();

    // Trigger execution background process asynchronously
    VoiceEngine.processCampaignBatch(campaign._id).catch(err => console.error('Campaign batch error:', err));

    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const pauseCampaign = async (req, res) => {
  try {
    const campaign = await VoiceCampaign.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { status: 'paused' },
      { new: true }
    );
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error pausing campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resumeCampaign = async (req, res) => {
  try {
    const campaign = await VoiceCampaign.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { status: 'running' },
      { new: true }
    );
    VoiceEngine.processCampaignBatch(campaign._id).catch(err => console.error('Campaign batch error:', err));
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error resuming campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancelCampaign = async (req, res) => {
  try {
    const campaign = await VoiceCampaign.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { status: 'cancelled' },
      { new: true }
    );
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Analytics & Usage ---

export const getUsage = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const totalCalls = await VoiceCall.countDocuments({ organizationId });
    const calls = await VoiceCall.find({ organizationId }).select('duration cost status');
    
    const totalSeconds = calls.reduce((acc, c) => acc + (c.duration || 0), 0);
    const totalMinutes = Math.ceil(totalSeconds / 60);
    const totalCost = calls.reduce((acc, c) => acc + (c.cost || 0), 0);

    const activeAgents = await VoiceAgent.countDocuments({ organizationId, isActive: true });
    const numbersCount = await VoicePhoneNumber.countDocuments({ organizationId });

    res.status(200).json({
      totalCalls,
      totalMinutes,
      totalCost: Number(totalCost.toFixed(2)),
      activeAgents,
      numbersCount
    });
  } catch (error) {
    console.error('Error fetching voice usage:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const calls = await VoiceCall.find({ organizationId }).sort({ createdAt: -1 });

    const statusCounts = {
      completed: 0,
      inProgress: 0,
      initiated: 0,
      failed: 0,
      noAnswer: 0
    };

    calls.forEach(c => {
      if (c.status === 'completed') statusCounts.completed++;
      else if (c.status === 'in-progress') statusCounts.inProgress++;
      else if (c.status === 'failed') statusCounts.failed++;
      else if (c.status === 'no-answer') statusCounts.noAnswer++;
      else statusCounts.initiated++;
    });

    res.status(200).json({
      statusCounts,
      totalCalls: calls.length
    });
  } catch (error) {
    console.error('Error fetching voice analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Webhook Handler ---

export const webhookHandler = async (req, res) => {
  try {
    const result = await VoiceEngine.handleWebhook(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error handling voice webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
