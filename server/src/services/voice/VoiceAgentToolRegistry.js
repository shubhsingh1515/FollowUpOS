import { Lead, FollowUpTask, Activity } from '../../models/index.js';

export class VoiceAgentToolRegistry {
  constructor() {
    this.tools = new Map();
    this.registerDefaultTools();
  }

  registerTool(toolDefinition) {
    if (!toolDefinition.name || typeof toolDefinition.handler !== 'function') {
      throw new Error('Tool must have a name and a valid handler function');
    }
    this.tools.set(toolDefinition.name, toolDefinition);
  }

  getTool(name) {
    return this.tools.get(name);
  }

  listTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      permission: t.permission || 'agent'
    }));
  }

  async executeTool(name, args = {}, context = {}) {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found in registry`);
    }

    // Context contains organizationId, leadId, callId
    return await tool.handler(args, context);
  }

  registerDefaultTools() {
    // 1. Qualify Lead
    this.registerTool({
      name: 'qualify_lead',
      description: 'Update lead qualification score and temperature based on conversation',
      inputSchema: {
        score: 'number (0-100)',
        temperature: 'string (hot, warm, cold)',
        notes: 'string'
      },
      handler: async (args, context) => {
        const { leadId, organizationId } = context;
        if (!leadId || !organizationId) return { success: false, message: 'Missing context' };

        const lead = await Lead.findOne({ _id: leadId, organizationId });
        if (!lead) return { success: false, message: 'Lead not found' };

        if (args.score !== undefined) lead.score = Number(args.score);
        if (args.temperature) lead.leadTemperature = args.temperature;
        if (args.score >= 80) lead.status = 'qualified';
        await lead.save();

        return { success: true, leadScore: lead.score, status: lead.status };
      }
    });

    // 2. Schedule Follow-up Task
    this.registerTool({
      name: 'schedule_followup',
      description: 'Create a follow-up task or reminder for the sales team',
      inputSchema: {
        title: 'string',
        dueDate: 'ISO Date string',
        priority: 'high|medium|low'
      },
      handler: async (args, context) => {
        const { leadId, organizationId } = context;
        if (!leadId || !organizationId) return { success: false, message: 'Missing context' };

        const task = await FollowUpTask.create({
          organizationId,
          leadId,
          title: args.title || 'AI Call Follow-up Task',
          dueDate: args.dueDate ? new Date(args.dueDate) : new Date(Date.now() + 24 * 3600 * 1000),
          priority: args.priority || 'medium',
          status: 'pending'
        });

        return { success: true, taskId: task._id };
      }
    });

    // 3. Update Lead Stage
    this.registerTool({
      name: 'update_lead_stage',
      description: 'Change the pipeline stage of the lead',
      inputSchema: {
        stage: 'new|contacted|qualified|proposal|negotiation|won|lost'
      },
      handler: async (args, context) => {
        const { leadId, organizationId } = context;
        const lead = await Lead.findOne({ _id: leadId, organizationId });
        if (!lead) return { success: false, message: 'Lead not found' };

        lead.status = args.stage || lead.status;
        await lead.save();
        return { success: true, stage: lead.status };
      }
    });

    // 4. Transfer to Human
    this.registerTool({
      name: 'transfer_to_human',
      description: 'Transfer call to human sales rep or log urgent callback request',
      inputSchema: {
        reason: 'string',
        targetPhone: 'string'
      },
      handler: async (args, context) => {
        const { leadId, organizationId } = context;
        await Activity.create({
          organizationId,
          leadId,
          type: 'call',
          title: 'Human Transfer Requested during AI Call',
          description: `Reason: ${args.reason || 'Lead requested human salesperson'}`,
          metadata: { urgent: true }
        });
        return { success: true, transferInitiated: true };
      }
    });
  }
}

export const voiceToolRegistry = new VoiceAgentToolRegistry();
export default voiceToolRegistry;
