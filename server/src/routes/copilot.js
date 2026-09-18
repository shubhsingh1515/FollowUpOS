import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAIProvider } from '../ai/index.js';
import { Lead } from '../models/Lead.js';
import { FollowUpTask } from '../models/FollowUpTask.js';
import { Deal } from '../models/Deal.js';
import { Contact } from '../models/Contact.js';
import { Organization } from '../models/Organization.js';
import { logger } from '../utils/logger.js';

const router = Router();
router.use(authenticate);

/**
 * Classify user query intent from natural language.
 */
function classifyIntent(query) {
  const q = query.toLowerCase();
  if (/today|contact now|reach out|priority|should i call/i.test(q)) return 'leads_today';
  if (/overdue|missed|haven.?t followed|no follow.?up|not contacted|unfollowed/i.test(q)) return 'overdue_followups';
  if (/hot lead|hot prospect|urgent lead|high priority lead/i.test(q)) return 'hot_leads';
  if (/pipeline|deals|opportunities|close.*month|forecast|revenue forecast/i.test(q)) return 'pipeline';
  if (/summary|daily|activity|today.*sales|stats|overview/i.test(q)) return 'summary';
  if (/follow.?up|task|schedule|due|reminder/i.test(q)) return 'followups';
  if (/cold lead|going cold|decay|silent|no reply/i.test(q)) return 'cold_leads';
  if (/win rate|conversion|close rate|performance/i.test(q)) return 'performance';
  return 'general';
}

/**
 * Gather real organization data for the given intent.
 */
async function gatherContextData(intent, organizationId) {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600000);

  switch (intent) {
    case 'leads_today': {
      const leads = await Lead.find({
        organizationId,
        isArchived: false,
        status: { $nin: ['won', 'lost'] },
        $or: [
          { nextFollowUpAt: { $lte: endOfDay } },
          { leadTemperature: 'hot' },
          { lastInboundAt: { $gte: new Date(Date.now() - 24 * 3600000) } },
        ],
      })
        .populate('contactId', 'fullName company')
        .sort({ leadScore: -1, nextFollowUpAt: 1 })
        .limit(8)
        .lean();
      return { leads, intent };
    }

    case 'overdue_followups': {
      const tasks = await FollowUpTask.find({
        organizationId,
        status: 'pending',
        scheduledAt: { $lt: now },
      })
        .populate({ path: 'leadId', populate: { path: 'contactId', select: 'fullName company' } })
        .sort({ scheduledAt: 1 })
        .limit(10)
        .lean();
      return { tasks, intent };
    }

    case 'hot_leads': {
      const leads = await Lead.find({
        organizationId,
        isArchived: false,
        leadTemperature: 'hot',
        status: { $nin: ['won', 'lost'] },
      })
        .populate('contactId', 'fullName company')
        .sort({ leadScore: -1 })
        .limit(8)
        .lean();
      return { leads, intent };
    }

    case 'pipeline': {
      const deals = await Deal.find({
        organizationId,
        stage: { $nin: ['won', 'lost'] },
      })
        .populate({ path: 'leadId', populate: { path: 'contactId', select: 'fullName company' } })
        .sort({ value: -1 })
        .limit(10)
        .lean();

      const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
      const weightedValue = deals.reduce((sum, d) => sum + (d.value || 0) * ((d.probability || 50) / 100), 0);
      return { deals, totalValue, weightedValue, intent };
    }

    case 'summary': {
      const [
        totalLeads,
        hotLeads,
        pendingTasks,
        overdueTasks,
        wonThisMonth,
      ] = await Promise.all([
        Lead.countDocuments({ organizationId, isArchived: false }),
        Lead.countDocuments({ organizationId, isArchived: false, leadTemperature: 'hot', status: { $nin: ['won', 'lost'] } }),
        FollowUpTask.countDocuments({ organizationId, status: 'pending', scheduledAt: { $lte: endOfDay } }),
        FollowUpTask.countDocuments({ organizationId, status: 'pending', scheduledAt: { $lt: now } }),
        Deal.countDocuments({ organizationId, stage: 'won', wonAt: { $gte: startOfMonth } }),
      ]);
      return { totalLeads, hotLeads, pendingTasks, overdueTasks, wonThisMonth, intent };
    }

    case 'followups': {
      const tasks = await FollowUpTask.find({
        organizationId,
        status: 'pending',
        scheduledAt: { $lte: endOfDay },
      })
        .populate({ path: 'leadId', populate: { path: 'contactId', select: 'fullName company' } })
        .sort({ scheduledAt: 1 })
        .limit(10)
        .lean();
      return { tasks, intent };
    }

    case 'cold_leads': {
      const leads = await Lead.find({
        organizationId,
        isArchived: false,
        status: { $nin: ['won', 'lost'] },
        lastInboundAt: { $lt: sevenDaysAgo },
        leadTemperature: { $ne: 'cold' },
      })
        .populate('contactId', 'fullName company')
        .sort({ leadScore: -1 })
        .limit(8)
        .lean();
      return { leads, intent };
    }

    case 'performance': {
      const [totalLeads, wonLeads] = await Promise.all([
        Lead.countDocuments({ organizationId }),
        Lead.countDocuments({ organizationId, status: 'won' }),
      ]);
      const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100 * 10) / 10 : 0;
      return { totalLeads, wonLeads, winRate, intent };
    }

    default:
      return { intent };
  }
}

/**
 * Build a structured prompt for AI using real data context.
 */
function buildPrompt(query, contextData, orgName) {
  const { intent } = contextData;
  let dataSection = '';

  if (intent === 'leads_today' && contextData.leads) {
    const leadLines = contextData.leads.map(l =>
      `- ${l.contactId?.fullName || 'Unknown'} (${l.contactId?.company || ''}): Score ${l.leadScore || 0}, ${l.leadTemperature || 'cold'}, Follow-up: ${l.nextFollowUpAt ? new Date(l.nextFollowUpAt).toLocaleString() : 'not scheduled'}`
    ).join('\n');
    dataSection = `Today's priority leads (${contextData.leads.length}):\n${leadLines || 'No priority leads found.'}`;
  } else if (intent === 'overdue_followups' && contextData.tasks) {
    const taskLines = contextData.tasks.map(t =>
      `- ${t.leadId?.contactId?.fullName || 'Unknown'} (${t.leadId?.contactId?.company || ''}): Due ${new Date(t.scheduledAt).toLocaleString()}, Channel: ${t.channel || 'unknown'}`
    ).join('\n');
    dataSection = `Overdue follow-up tasks (${contextData.tasks.length}):\n${taskLines || 'No overdue tasks.'}`;
  } else if (intent === 'hot_leads' && contextData.leads) {
    const leadLines = contextData.leads.map(l =>
      `- ${l.contactId?.fullName || 'Unknown'} (${l.contactId?.company || ''}): Score ${l.leadScore || 0}, Value: ${l.estimatedValue || 0}`
    ).join('\n');
    dataSection = `Hot leads (${contextData.leads.length}):\n${leadLines || 'No hot leads.'}`;
  } else if (intent === 'pipeline' && contextData.deals) {
    const dealLines = contextData.deals.map(d =>
      `- ${d.leadId?.contactId?.fullName || d.title || 'Deal'}: ₹${(d.value || 0).toLocaleString()}, ${d.stage}, ${d.probability || 50}% probability`
    ).join('\n');
    dataSection = `Active pipeline:\nTotal: ₹${(contextData.totalValue || 0).toLocaleString()}\nWeighted: ₹${Math.round(contextData.weightedValue || 0).toLocaleString()}\nDeals:\n${dealLines || 'No active deals.'}`;
  } else if (intent === 'summary') {
    dataSection = `Sales summary:\n- Total leads: ${contextData.totalLeads}\n- Hot leads: ${contextData.hotLeads}\n- Pending follow-ups today: ${contextData.pendingTasks}\n- Overdue follow-ups: ${contextData.overdueTasks}\n- Deals won this month: ${contextData.wonThisMonth}`;
  } else if (intent === 'followups' && contextData.tasks) {
    const taskLines = contextData.tasks.map(t =>
      `- ${t.leadId?.contactId?.fullName || 'Unknown'}: ${t.channel || 'email'}, due ${new Date(t.scheduledAt).toLocaleString()}`
    ).join('\n');
    dataSection = `Follow-ups due today (${contextData.tasks.length}):\n${taskLines || 'None.'}`;
  } else if (intent === 'cold_leads' && contextData.leads) {
    const leadLines = contextData.leads.map(l =>
      `- ${l.contactId?.fullName || 'Unknown'} (${l.contactId?.company || ''}): Last active ${l.lastInboundAt ? new Date(l.lastInboundAt).toLocaleDateString() : 'never'}`
    ).join('\n');
    dataSection = `Leads going cold:\n${leadLines || 'None detected.'}`;
  } else if (intent === 'performance') {
    dataSection = `Performance:\n- Total leads: ${contextData.totalLeads}\n- Won: ${contextData.wonLeads}\n- Win rate: ${contextData.winRate}%`;
  }

  return `You are the AI Copilot for ${orgName}, a CRM sales assistant. Answer the following sales question using ONLY the real data provided below. Be specific, actionable, and concise. Never invent numbers or names not present in the data.

Real data from ${orgName}'s CRM:
${dataSection || 'No specific data available for this query.'}

User question: "${query}"

Provide a helpful, specific answer based only on the data above. If the data shows empty results, say so honestly.`;
}

/**
 * Build structured response from real data (no AI needed for simple data listing).
 */
function buildStructuredResponse(contextData, query) {
  const { intent } = contextData;

  if (intent === 'leads_today') {
    const leads = (contextData.leads || []).map(l => ({
      id: l._id,
      name: l.contactId?.fullName || 'Unknown',
      company: l.contactId?.company || '',
      score: l.leadScore || 0,
      temperature: l.leadTemperature || 'cold',
      reason: l.nextFollowUpAt
        ? `Follow-up due ${new Date(l.nextFollowUpAt).toLocaleString()}`
        : l.lastInboundAt
          ? 'Recent inbound message'
          : 'Hot lead requiring attention',
    }));
    return {
      type: 'leads_list',
      leads,
      count: leads.length,
    };
  }

  if (intent === 'hot_leads' || intent === 'cold_leads') {
    const leads = (contextData.leads || []).map(l => ({
      id: l._id,
      name: l.contactId?.fullName || 'Unknown',
      company: l.contactId?.company || '',
      score: l.leadScore || 0,
      temperature: l.leadTemperature || 'cold',
      value: l.estimatedValue || 0,
      reason: intent === 'cold_leads'
        ? `Last activity: ${l.lastInboundAt ? new Date(l.lastInboundAt).toLocaleDateString() : 'never'}`
        : `Score: ${l.leadScore || 0}`,
    }));
    return { type: 'leads_list', leads, count: leads.length };
  }

  if (intent === 'overdue_followups' || intent === 'followups') {
    const tasks = (contextData.tasks || []).map(t => ({
      id: t._id,
      leadName: t.leadId?.contactId?.fullName || 'Unknown',
      company: t.leadId?.contactId?.company || '',
      channel: t.channel,
      dueAt: t.scheduledAt,
    }));
    return { type: 'followups_list', tasks, count: tasks.length };
  }

  if (intent === 'pipeline') {
    const deals = (contextData.deals || []).map(d => ({
      name: d.leadId?.contactId?.fullName || d.title || 'Deal',
      value: d.value || 0,
      probability: d.probability || 50,
      stage: d.stage,
      expectedRevenue: Math.round((d.value || 0) * ((d.probability || 50) / 100)),
    }));
    return {
      type: 'opportunities',
      deals,
      totalPipeline: contextData.totalValue || 0,
      weightedForecast: Math.round(contextData.weightedValue || 0),
    };
  }

  if (intent === 'summary') {
    return {
      type: 'summary',
      stats: {
        totalLeads: contextData.totalLeads || 0,
        hotLeads: contextData.hotLeads || 0,
        pendingTasks: contextData.pendingTasks || 0,
        overdueTasks: contextData.overdueTasks || 0,
        wonThisMonth: contextData.wonThisMonth || 0,
      },
    };
  }

  if (intent === 'performance') {
    return {
      type: 'performance',
      totalLeads: contextData.totalLeads || 0,
      wonLeads: contextData.wonLeads || 0,
      winRate: contextData.winRate || 0,
    };
  }

  return { type: 'general' };
}

router.post('/query', async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const orgId = req.organizationId;
    const org = await Organization.findById(orgId).select('name').lean();
    const orgName = org?.name || 'Your Organization';

    // Classify query intent
    const intent = classifyIntent(query);

    // Gather real data from MongoDB
    const contextData = await gatherContextData(intent, orgId);

    // Build structured response (for data-type queries)
    const structured = buildStructuredResponse(contextData, query);

    // Generate AI text response using real data
    let aiText = '';
    try {
      const ai = getAIProvider();
      const prompt = buildPrompt(query, contextData, orgName);
      const result = await ai.generateText(prompt, { maxTokens: 400 });
      aiText = result?.text || result || '';
    } catch (aiErr) {
      logger.warn('Copilot AI generation failed, using structured data only', { error: aiErr.message });
      // Fall through — structured data response is still useful
    }

    // Generate a fallback text summary if AI failed
    if (!aiText) {
      if (intent === 'leads_today') {
        aiText = contextData.leads?.length
          ? `You have ${contextData.leads.length} priority lead${contextData.leads.length !== 1 ? 's' : ''} to contact today.`
          : "No priority leads found for today. You're all caught up!";
      } else if (intent === 'overdue_followups') {
        aiText = contextData.tasks?.length
          ? `You have ${contextData.tasks.length} overdue follow-up task${contextData.tasks.length !== 1 ? 's' : ''} that need immediate attention.`
          : "No overdue follow-up tasks. Great work staying on top of things!";
      } else if (intent === 'hot_leads') {
        aiText = contextData.leads?.length
          ? `You have ${contextData.leads.length} hot lead${contextData.leads.length !== 1 ? 's' : ''} currently in your pipeline.`
          : "No hot leads at this time. Consider running AI analysis on recent leads to identify high-intent prospects.";
      } else if (intent === 'pipeline') {
        aiText = contextData.deals?.length
          ? `Your active pipeline has ${contextData.deals.length} deal${contextData.deals.length !== 1 ? 's' : ''} worth ₹${(contextData.totalValue || 0).toLocaleString()} total (₹${Math.round(contextData.weightedValue || 0).toLocaleString()} weighted).`
          : "No active deals in your pipeline. Create deals from your leads to start tracking revenue.";
      } else if (intent === 'summary') {
        aiText = `Sales summary: ${contextData.totalLeads || 0} total leads, ${contextData.hotLeads || 0} hot, ${contextData.pendingTasks || 0} follow-ups due today (${contextData.overdueTasks || 0} overdue), ${contextData.wonThisMonth || 0} deals won this month.`;
      } else {
        aiText = `I found data related to your query. Please review the results below.`;
      }
    }

    res.json({
      success: true,
      data: {
        query,
        intent,
        answer: {
          ...structured,
          text: aiText,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
