import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

// Resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (err) {}

// Models
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Contact } from '../models/Contact.js';
import { Lead } from '../models/Lead.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { FollowUpSequence } from '../models/FollowUpSequence.js';
import { FollowUpTask } from '../models/FollowUpTask.js';
import { Deal } from '../models/Deal.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { Integration } from '../models/Integration.js';

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log('📡 Connecting to MongoDB:', config.mongoUri.replace(/:([^@]+)@/, ':****@'));

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('✅ Connected to MongoDB Atlas successfully');

  // Clean existing users with shubham@gmail.com or demo@followupos.com
  const existingUsers = await User.find({
    email: { $in: ['shubham@gmail.com', 'demo@followupos.com'] },
  });

  const orgIdsToClean = existingUsers.map(u => u.organizationId).filter(Boolean);
  
  if (orgIdsToClean.length > 0) {
    console.log(`🧹 Cleaning previous data for ${orgIdsToClean.length} organization(s)...`);
    await Promise.all([
      User.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Contact.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Lead.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Conversation.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Message.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      FollowUpSequence.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      FollowUpTask.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Deal.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Activity.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Notification.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Integration.deleteMany({ organizationId: { $in: orgIdsToClean } }),
      Organization.deleteMany({ _id: { $in: orgIdsToClean } }),
    ]);
  }

  // Also clean any orphan demo orgs
  const demoOrgs = await Organization.find({ isDemo: true });
  if (demoOrgs.length > 0) {
    const demoIds = demoOrgs.map(o => o._id);
    await Promise.all([
      User.deleteMany({ organizationId: { $in: demoIds } }),
      Contact.deleteMany({ organizationId: { $in: demoIds } }),
      Lead.deleteMany({ organizationId: { $in: demoIds } }),
      Conversation.deleteMany({ organizationId: { $in: demoIds } }),
      Message.deleteMany({ organizationId: { $in: demoIds } }),
      FollowUpSequence.deleteMany({ organizationId: { $in: demoIds } }),
      FollowUpTask.deleteMany({ organizationId: { $in: demoIds } }),
      Deal.deleteMany({ organizationId: { $in: demoIds } }),
      Activity.deleteMany({ organizationId: { $in: demoIds } }),
      Notification.deleteMany({ organizationId: { $in: demoIds } }),
      Integration.deleteMany({ organizationId: { $in: demoIds } }),
      Organization.deleteMany({ _id: { $in: demoIds } }),
    ]);
  }

  // 1. Create Organization for Shubham
  const org = await Organization.create({
    name: 'GrowthScale Digital Agency',
    slug: 'growthscale-agency',
    industry: 'digital_agency',
    description: 'Premier B2B growth and digital transformation agency specializing in high-performance websites, AI automations, and multi-channel customer acquisition.',
    services: [
      'Website & App Development',
      'AI Lead Automation',
      'SEO & Content Growth',
      'Google & Meta Ads',
      'WhatsApp Sales Cadences',
      'UI/UX & Brand Design',
    ],
    targetCustomers: 'SMBs, funded startups, dental & healthcare clinics, real estate firms, and e-commerce brands',
    averageDealValue: 120000,
    salesCycleLength: '2-4 weeks',
    teamSize: 6,
    website: 'https://growthscale.in',
    phone: '+91 98765 01234',
    email: 'shubham@gmail.com',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    location: 'Bangalore, India',
    isDemo: false,
    onboardingCompleted: true,
    settings: {
      defaultTone: 'professional',
      aiEnabled: true,
      autoFollowUpEnabled: true,
      requireHumanApproval: true,
      defaultLeadScore: 50,
      defaultFollowUpDelay: 24,
      language: 'english',
    },
    subscription: {
      plan: 'growth',
      status: 'active',
      limits: { leads: 5000, users: 10 },
    },
  });

  console.log('✅ Organization created:', org.name);

  // 2. Create Shubham's user account and team members
  const shubhamPasswordHash = await bcrypt.hash('shubham123', 12);
  const demoPasswordHash = await bcrypt.hash('Demo@1234', 12);

  const shubham = await User.create({
    name: 'Shubham Singh',
    email: 'shubham@gmail.com',
    passwordHash: shubhamPasswordHash,
    role: 'owner',
    organizationId: org._id,
    onboardingCompleted: true,
    lastLoginAt: new Date(),
    avatar: null,
  });

  const demoUser = await User.create({
    name: 'Arjun Kapoor',
    email: 'demo@followupos.com',
    passwordHash: demoPasswordHash,
    role: 'owner',
    organizationId: org._id,
    onboardingCompleted: true,
    lastLoginAt: new Date(),
    avatar: null,
  });

  const salesRep = await User.create({
    name: 'Sneha Patel',
    email: 'sneha@growthscale.in',
    passwordHash: demoPasswordHash,
    role: 'sales_rep',
    organizationId: org._id,
    onboardingCompleted: true,
    avatar: null,
  });

  const manager = await User.create({
    name: 'Vikram Sinha',
    email: 'vikram@growthscale.in',
    passwordHash: demoPasswordHash,
    role: 'manager',
    organizationId: org._id,
    onboardingCompleted: true,
    avatar: null,
  });

  console.log(`✅ Users created:\n   - ${shubham.email} (Owner)\n   - ${demoUser.email} (Demo)\n   - ${salesRep.email}\n   - ${manager.email}`);

  // 3. Create default follow-up sequences
  const sequence = await FollowUpSequence.create({
    organizationId: org._id,
    name: 'High-Intent Inbound Sequence',
    description: 'Standard 4-step multi-channel cadence for qualified inbound leads',
    isDefault: true,
    active: true,
    steps: [
      { stepNumber: 1, delay: 0, delayUnit: 'hours', name: 'Instant WhatsApp & Cal Link', useAI: true, requireApproval: true },
      { stepNumber: 2, delay: 24, delayUnit: 'hours', name: 'Case Study & ROI Proof Email', useAI: true, requireApproval: true },
      { stepNumber: 3, delay: 3, delayUnit: 'days', name: 'Value Proposition Question', useAI: true, requireApproval: true },
      { stepNumber: 4, delay: 6, delayUnit: 'days', name: 'Final Check-in / Breakup Note', useAI: true, requireApproval: true },
    ],
  });

  // 4. Create connected Integrations
  await Integration.create([
    {
      organizationId: org._id,
      provider: 'whatsapp',
      type: 'messaging',
      status: 'connected',
      lastSyncAt: new Date(),
      metadata: new Map([
        ['phoneNumber', '+91 98765 01234'],
        ['businessName', 'GrowthScale Digital'],
        ['qualityRating', 'GREEN'],
      ]),
    },
    {
      organizationId: org._id,
      provider: 'email',
      type: 'email',
      status: 'connected',
      lastSyncAt: new Date(),
      metadata: new Map([
        ['connectedEmail', 'shubham@gmail.com'],
        ['smtpHost', 'smtp.gmail.com'],
      ]),
    },
    {
      organizationId: org._id,
      provider: 'calendly',
      type: 'calendar',
      status: 'connected',
      lastSyncAt: new Date(),
      metadata: new Map([
        ['bookingUrl', 'https://calendly.com/growthscale/discovery-call'],
      ]),
    },
  ]);

  console.log('✅ Integrations initialized');

  // 5. Rich Leads Dataset
  const leadsData = [
    {
      contact: { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@dentalcare.in', phone: '+91 98760 11234', company: 'DentalCare Clinics', jobTitle: 'Managing Doctor' },
      lead: { source: 'website', status: 'qualified', estimatedValue: 140000, leadScore: 92, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.95, service: 'Website & App Development', timeline: '4 weeks', budget: { min: 100000, max: 180000, currency: 'INR' }, aiSummary: 'Rahul owns a 3-branch dental clinic network in Mumbai. Needs online booking, patient portal, and local SEO. Highly engaged with high budget.', recommendedAction: 'Send final contract proposal and schedule onboarding call.', isQualified: true },
      messages: [
        { content: 'Hi, we are looking for a complete revamp of our dental clinic website with online booking and WhatsApp confirmations.', direction: 'inbound', senderType: 'customer', daysAgo: 3 },
        { content: 'Hi Rahul! We specialize in healthcare & dental clinic platforms. We can build a fast, modern patient portal with automated WhatsApp appointment reminders and local SEO. Let\'s schedule a 15-minute demo call.', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 3 },
        { content: 'That sounds great. We have 3 branches and budget around 1.5 Lakhs. When can we start?', direction: 'inbound', senderType: 'customer', daysAgo: 2 },
        { content: 'We can kick off as early as Monday! I am sending over our scope breakdown and agreement. You can pick a kick-off slot here: https://calendly.com/growthscale/discovery-call', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 1 },
        { content: 'Received. Reviewing with my clinic partner today!', direction: 'inbound', senderType: 'customer', daysAgo: 0 },
      ],
      owner: shubham._id,
    },
    {
      contact: { firstName: 'Priya', lastName: 'Mehta', email: 'priya@stylehub.in', phone: '+91 98760 22345', company: 'StyleHub E-Commerce', jobTitle: 'Founder & CEO' },
      lead: { source: 'instagram', status: 'proposal', estimatedValue: 220000, leadScore: 88, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.91, service: 'AI Lead Automation', timeline: '2 weeks', budget: { min: 150000, max: 250000, currency: 'INR' }, aiSummary: 'Priya runs an apparel brand doing ₹25L/month on Shopify. Needs automated WhatsApp abandoned cart recovery and AI customer support.', recommendedAction: 'Follow up on proposal — opened 3 times today.', isQualified: true },
      messages: [
        { content: 'Hey team, saw your case study on 4.2x WhatsApp abandoned cart recovery. We need this for our fashion store ASAP.', direction: 'inbound', senderType: 'customer', daysAgo: 4 },
        { content: 'Hi Priya! Yes, our automated WhatsApp recovery system typically recaptures 18-24% of abandoned checkouts in the first 30 days. Let\'s review your Shopify metrics.', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 4 },
        { content: 'Proposal looks very comprehensive. Can we do a quick 10-min call on integration time?', direction: 'inbound', senderType: 'customer', daysAgo: 1 },
      ],
      owner: salesRep._id,
    },
    {
      contact: { firstName: 'Amitabh', lastName: 'Verma', email: 'amitabh@apexrealty.in', phone: '+91 98760 33456', company: 'Apex Prime Realty', jobTitle: 'VP Sales' },
      lead: { source: 'whatsapp', status: 'negotiation', estimatedValue: 350000, leadScore: 84, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.86, service: 'AI Lead Automation', timeline: 'Immediate', budget: { min: 300000, max: 400000, currency: 'INR' }, aiSummary: 'Apex Prime generates 500+ real estate leads/week from Meta ads. Needs sub-2-minute instant qualification routing.', recommendedAction: 'Confirm 10% annual prepayment discount to close contract today.', isQualified: true },
      messages: [
        { content: 'Our sales team is taking 4 hours to call Meta ad leads. We are losing deals to competitors.', direction: 'inbound', senderType: 'customer', daysAgo: 5 },
        { content: 'Hi Amitabh, with FollowUpOS sub-2-minute AI router, your leads receive an instant WhatsApp qualification prompt within 90 seconds. We double connect rates.', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 5 },
        { content: 'If you can support 15 sales agents and custom CRM webhook, we are ready to sign.', direction: 'inbound', senderType: 'customer', daysAgo: 2 },
      ],
      owner: shubham._id,
    },
    {
      contact: { firstName: 'Rohan', lastName: 'Mehta', email: 'rohan@apexlogistics.com', phone: '+91 98760 44567', company: 'Apex Global Logistics', jobTitle: 'Director of Growth' },
      lead: { source: 'linkedin', status: 'qualified', estimatedValue: 180000, leadScore: 78, leadTemperature: 'hot', intent: 'inquiry', intentConfidence: 0.8, service: 'Google & Meta Ads', timeline: '1 month', budget: { min: 120000, max: 200000, currency: 'INR' }, aiSummary: 'B2B logistics provider looking to scale freight forwarding inquiries across UAE and India.', recommendedAction: 'Send logistics case study before executive review.', isQualified: true },
      messages: [
        { content: 'Hi, exploring B2B lead generation partners for container shipping and logistics.', direction: 'inbound', senderType: 'customer', daysAgo: 6 },
        { content: 'Hi Rohan! We manage multi-channel B2B campaigns generating high-ticket freight contracts. Let\'s connect.', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 6 },
      ],
      owner: manager._id,
    },
    {
      contact: { firstName: 'Suresh', lastName: 'Pillai', email: 'suresh@coastalproperties.in', phone: '+91 98760 55678', company: 'Coastal Properties Group', jobTitle: 'Managing Partner' },
      lead: { source: 'website', status: 'won', estimatedValue: 480000, leadScore: 98, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.99, service: 'Website & App Development', timeline: 'Completed', budget: { min: 400000, max: 500000, currency: 'INR' }, aiSummary: 'Enterprise luxury property portal with interactive 3D floor plans and broker CRM sync. Deal won and paid.', isQualified: true },
      messages: [
        { content: 'Project agreement signed and advance payment initiated.', direction: 'inbound', senderType: 'customer', daysAgo: 14 },
      ],
      owner: shubham._id,
    },
    {
      contact: { firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah@beaconhealth.co', phone: '+91 98760 66789', company: 'Beacon Health Partners', jobTitle: 'VP Operations' },
      lead: { source: 'email', status: 'won', estimatedValue: 520000, leadScore: 96, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.98, service: 'AI Lead Automation', timeline: 'Completed', budget: { min: 450000, max: 600000, currency: 'INR' }, aiSummary: 'Annual enterprise multi-clinic patient intake cadence automation. Contract closed.', isQualified: true },
      messages: [
        { content: 'Contract executed. Looking forward to kick-off!', direction: 'inbound', senderType: 'customer', daysAgo: 18 },
      ],
      owner: salesRep._id,
    },
    {
      contact: { firstName: 'Neha', lastName: 'Joshi', email: 'neha@immigrationpro.in', phone: '+91 98760 77890', company: 'Immigration Pro Overseas', jobTitle: 'Founder' },
      lead: { source: 'facebook', status: 'contacted', estimatedValue: 95000, leadScore: 68, leadTemperature: 'warm', intent: 'inquiry', intentConfidence: 0.7, service: 'SEO & Content Growth', timeline: '2 months', budget: { min: 70000, max: 120000, currency: 'INR' }, aiSummary: 'Immigration consultancy needing first-page Google rankings for student and work visas.', recommendedAction: 'Send SEO audit and keyword competitor report.' },
      messages: [
        { content: 'Hi, I need more inbound inquiries from Google for our study abroad programs in Canada & UK.', direction: 'inbound', senderType: 'customer', daysAgo: 2 },
        { content: 'Hi Neha! We ran a quick preliminary audit of your site and found high-intent keywords with low competition. Would you like to review our audit deck?', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 2 },
      ],
      owner: manager._id,
    },
    {
      contact: { firstName: 'Kavita', lastName: 'Rao', email: 'kavita@eduprime.in', phone: '+91 98760 88901', company: 'EduPrime Institute', jobTitle: 'Academic Director' },
      lead: { source: 'google_forms', status: 'contacted', estimatedValue: 110000, leadScore: 62, leadTemperature: 'warm', intent: 'inquiry', intentConfidence: 0.65, service: 'Website & App Development', timeline: '6 weeks', budget: { min: 80000, max: 140000, currency: 'INR' }, aiSummary: 'EdTech coaching platform requiring online student enrollment and test series download module.' },
      messages: [
        { content: 'Submitted form for course management website and payment gateway integration.', direction: 'inbound', senderType: 'customer', daysAgo: 1 },
      ],
      owner: shubham._id,
    },
    {
      contact: { firstName: 'Vikram', lastName: 'Deshmukh', email: 'vikram@deshmukhindustries.in', phone: '+91 98760 99012', company: 'Deshmukh Engineering', jobTitle: 'Managing Director' },
      lead: { source: 'website', status: 'new', estimatedValue: 160000, leadScore: 58, leadTemperature: 'warm', intent: 'inquiry', intentConfidence: 0.6, service: 'Website & App Development', timeline: '3 months', budget: { min: 120000, max: 200000, currency: 'INR' }, aiSummary: 'Industrial machinery manufacturer wanting modern B2B product catalog with inquiry request RFQ system.' },
      messages: [
        { content: 'We want to replace our 2012 company website with modern responsive product catalog.', direction: 'inbound', senderType: 'customer', daysAgo: 0 },
      ],
      owner: salesRep._id,
    },
    {
      contact: { firstName: 'Ananya', lastName: 'Roy', email: 'ananya@roylaw.in', phone: '+91 98760 00123', company: 'Roy & Associates Law', jobTitle: 'Senior Partner' },
      lead: { source: 'whatsapp', status: 'new', estimatedValue: 85000, leadScore: 52, leadTemperature: 'cold', intent: 'inquiry', intentConfidence: 0.5, service: 'UI/UX & Brand Design', timeline: 'Flexible', budget: { min: 60000, max: 100000, currency: 'INR' }, aiSummary: 'Corporate legal practice wanting brand identity guidelines and new corporate website.' },
      messages: [
        { content: 'Need a brand refresh and website redesign for our corporate law firm.', direction: 'inbound', senderType: 'customer', daysAgo: 0 },
      ],
      owner: manager._id,
    },
    {
      contact: { firstName: 'Manish', lastName: 'Tiwari', email: 'manish@tiwarilogistics.com', phone: '+91 98760 12345', company: 'Tiwari Transport', jobTitle: 'Proprietor' },
      lead: { source: 'email', status: 'lost', estimatedValue: 40000, leadScore: 22, leadTemperature: 'cold', intent: 'research', intentConfidence: 0.3, service: 'Website & App Development', timeline: null, budget: { min: 20000, max: 35000, currency: 'INR' }, aiSummary: 'Budget mismatch for custom development requirements. Archived to nurture list.' },
      messages: [
        { content: 'Looking for cheapest template website.', direction: 'inbound', senderType: 'customer', daysAgo: 25 },
      ],
      owner: salesRep._id,
    },
  ];

  // 6. Create leads, contacts, conversations, messages, activities
  const createdLeads = [];
  const now = new Date();

  for (const data of leadsData) {
    const contact = await Contact.create({
      organizationId: org._id,
      ...data.contact,
      fullName: `${data.contact.firstName} ${data.contact.lastName}`,
      source: data.lead.source,
      tags: [data.lead.service.split(' ')[0]],
    });

    const lastMsgDays = data.messages.length > 0 ? data.messages[data.messages.length - 1].daysAgo : 5;
    const leadCreatedAt = new Date(now.getTime() - (lastMsgDays + 5) * 86400000);

    const lead = await Lead.create({
      organizationId: org._id,
      contactId: contact._id,
      ownerId: data.owner,
      title: `${contact.fullName} — ${data.lead.service || 'Inquiry'}`,
      ...data.lead,
      tags: [data.lead.service.split(' ')[0]],
      lastAnalyzedAt: new Date(now.getTime() - lastMsgDays * 86400000),
      lastContactAt: new Date(now.getTime() - lastMsgDays * 86400000),
      lastInboundAt: ['hot', 'warm'].includes(data.lead.leadTemperature) ? new Date(now.getTime() - Math.min(lastMsgDays, 1) * 3600000 * 4) : null,
      nextFollowUpAt: ['new', 'contacted', 'qualified', 'proposal', 'negotiation'].includes(data.lead.status) 
        ? new Date(now.getTime() + (Math.random() * 24 - 4) * 3600000) // Some due today/soon
        : null,
      createdAt: leadCreatedAt,
    });

    const conversation = await Conversation.create({
      organizationId: org._id,
      leadId: lead._id,
      contactId: contact._id,
      channel: data.lead.source === 'whatsapp' ? 'whatsapp' : data.lead.source === 'instagram' ? 'instagram' : 'email',
      status: ['won', 'lost'].includes(data.lead.status) ? 'closed' : 'open',
      lastMessageAt: new Date(now.getTime() - lastMsgDays * 86400000),
    });

    for (const msg of data.messages) {
      await Message.create({
        organizationId: org._id,
        conversationId: conversation._id,
        leadId: lead._id,
        senderType: msg.senderType,
        senderId: msg.senderType === 'customer' ? contact._id : data.owner,
        direction: msg.direction,
        channel: conversation.channel,
        content: msg.content,
        aiGenerated: msg.aiGenerated || false,
        deliveryStatus: 'delivered',
        createdAt: new Date(now.getTime() - msg.daysAgo * 86400000),
      });
    }

    await Activity.create({
      organizationId: org._id,
      leadId: lead._id,
      contactId: contact._id,
      userId: data.owner,
      type: 'lead_created',
      title: `Lead captured for ${contact.fullName} via ${data.lead.source}`,
      createdAt: leadCreatedAt,
    });

    await Activity.create({
      organizationId: org._id,
      leadId: lead._id,
      userId: data.owner,
      type: 'ai_analyzed',
      title: `AI analyzed intent — Score: ${data.lead.leadScore}, ${data.lead.leadTemperature.toUpperCase()}`,
      metadata: { score: data.lead.leadScore, temperature: data.lead.leadTemperature },
      createdAt: new Date(now.getTime() - lastMsgDays * 86400000),
    });

    createdLeads.push({ lead, contact, conversation });
  }

  console.log(`✅ Seeded ${createdLeads.length} leads with contacts & conversation histories`);

  // 7. Create Deals (Won deals + in-pipeline deals)
  const wonLeads = createdLeads.filter(l => l.lead.status === 'won');
  for (const wonItem of wonLeads) {
    const deal = await Deal.create({
      organizationId: org._id,
      leadId: wonItem.lead._id,
      ownerId: wonItem.lead.ownerId,
      name: `${wonItem.contact.company} — ${wonItem.lead.service}`,
      value: wonItem.lead.estimatedValue,
      currency: 'INR',
      stage: 'won',
      probability: 100,
      wonAt: new Date(now.getTime() - Math.random() * 10 * 86400000),
    });

    await Activity.create({
      organizationId: org._id,
      leadId: wonItem.lead._id,
      userId: wonItem.lead.ownerId,
      type: 'deal_won',
      title: `Deal Closed Won: ${deal.name} — ₹${deal.value.toLocaleString('en-IN')}`,
      metadata: { dealId: deal._id, value: deal.value },
      createdAt: deal.wonAt,
    });
  }

  const activePipelineLeads = createdLeads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.lead.status));
  for (const item of activePipelineLeads) {
    const dealStage = item.lead.status === 'qualified' ? 'qualification' : item.lead.status;
    await Deal.create({
      organizationId: org._id,
      leadId: item.lead._id,
      ownerId: item.lead.ownerId,
      name: `${item.contact.company} — ${item.lead.service}`,
      value: item.lead.estimatedValue,
      currency: 'INR',
      stage: dealStage,
      probability: dealStage === 'negotiation' ? 80 : dealStage === 'proposal' ? 60 : 40,
      expectedCloseDate: new Date(now.getTime() + (7 + Math.random() * 14) * 86400000),
    });
  }

  console.log(`✅ Deals created for pipeline and won revenue`);

  // 8. Create FollowUpTasks for active leads
  const activeFollowUpLeads = createdLeads.filter(l => !['won', 'lost'].includes(l.lead.status));
  for (const { lead, contact } of activeFollowUpLeads.slice(0, 6)) {
    const isOverdue = lead.leadScore > 85;
    const scheduledAt = isOverdue
      ? new Date(now.getTime() - 2 * 3600000) // 2 hours overdue
      : new Date(now.getTime() + (2 + Math.random() * 6) * 3600000);

    await FollowUpTask.create({
      organizationId: org._id,
      leadId: lead._id,
      sequenceId: sequence._id,
      stepNumber: 2,
      type: 'auto_followup',
      channel: 'whatsapp',
      message: `Hi ${contact.firstName}, following up on your ${lead.service} inquiry. Would you like to review our brief implementation plan today?`,
      scheduledAt,
      status: 'pending',
      aiGenerated: true,
    });
  }

  // 9. Create Notifications
  await Notification.create([
    {
      organizationId: org._id,
      userId: shubham._id,
      type: 'hot_lead',
      title: '🔥 Hot Lead: Rahul Sharma (DentalCare Clinics)',
      message: 'Lead score 92. Budget ₹1.4L confirmed. Decision expected this week.',
      read: false,
      link: '/leads',
    },
    {
      organizationId: org._id,
      userId: shubham._id,
      type: 'customer_replied',
      title: '📩 Priya Mehta replied on WhatsApp',
      message: '"Proposal looks very comprehensive. Can we do a quick 10-min call on integration time?"',
      read: false,
      link: '/inbox',
    },
    {
      organizationId: org._id,
      userId: shubham._id,
      type: 'deal_won',
      title: '🎉 ₹5,20,000 Deal Won!',
      message: 'Beacon Health Partners enterprise contract closed and activated.',
      read: true,
      link: '/pipeline',
    },
  ]);

  console.log('✅ Follow-up tasks & notifications seeded');

  console.log('\n=============================================================');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log('=============================================================');
  console.log('🚀 Primary Login Credentials:');
  console.log('   Email:    shubham@gmail.com');
  console.log('   Password: shubham123');
  console.log('-------------------------------------------------------------');
  console.log('🔑 Demo Login Credentials (also available):');
  console.log('   Email:    demo@followupos.com');
  console.log('   Password: Demo@1234');
  console.log('-------------------------------------------------------------');
  console.log(`🏢 Organization:  ${org.name}`);
  console.log(`📊 Leads Created: ${createdLeads.length}`);
  console.log('=============================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
