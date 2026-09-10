import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

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

async function seed() {
  console.log('🌱 Starting seed...');

  await mongoose.connect(config.mongoUri);
  console.log('✅ Connected to MongoDB');

  // Clean existing demo data
  const existingDemo = await Organization.findOne({ isDemo: true });
  if (existingDemo) {
    console.log('🧹 Cleaning existing demo data...');
    await Promise.all([
      User.deleteMany({ organizationId: existingDemo._id }),
      Contact.deleteMany({ organizationId: existingDemo._id }),
      Lead.deleteMany({ organizationId: existingDemo._id }),
      Conversation.deleteMany({ organizationId: existingDemo._id }),
      Message.deleteMany({ organizationId: existingDemo._id }),
      FollowUpSequence.deleteMany({ organizationId: existingDemo._id }),
      FollowUpTask.deleteMany({ organizationId: existingDemo._id }),
      Deal.deleteMany({ organizationId: existingDemo._id }),
      Activity.deleteMany({ organizationId: existingDemo._id }),
      Notification.deleteMany({ organizationId: existingDemo._id }),
      Organization.deleteOne({ _id: existingDemo._id }),
    ]);
  }

  // Create demo organization
  const org = await Organization.create({
    name: 'BrightWeb Digital Agency',
    slug: 'brightweb-demo',
    industry: 'digital_agency',
    description: 'A full-service digital agency specializing in web development, SEO, and digital marketing for local and national businesses.',
    services: [
      'Website Development',
      'E-commerce Development',
      'SEO',
      'Google Ads',
      'Social Media Marketing',
      'Branding & Logo Design',
      'UI/UX Design',
      'WhatsApp Marketing',
    ],
    targetCustomers: 'SMBs, local businesses, startups, and enterprises',
    averageDealValue: 80000,
    salesCycleLength: '2-4 weeks',
    teamSize: 5,
    website: 'https://brightweb.in',
    phone: '+91 98765 43210',
    email: 'hello@brightweb.in',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    location: 'Mumbai, India',
    isDemo: true,
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
      limits: { leads: 5000, users: 5 },
    },
  });

  console.log('✅ Organization created:', org.name);

  // Create team members
  const passwordHash = await bcrypt.hash('Demo@1234', 12);

  const owner = await User.create({
    name: 'Arjun Kapoor',
    email: 'demo@followupos.com',
    passwordHash,
    role: 'owner',
    organizationId: org._id,
    onboardingCompleted: true,
    lastLoginAt: new Date(),
    avatar: null,
  });

  const salesRep = await User.create({
    name: 'Sneha Patel',
    email: 'sneha@brightweb.in',
    passwordHash,
    role: 'sales_rep',
    organizationId: org._id,
    onboardingCompleted: true,
    avatar: null,
  });

  const manager = await User.create({
    name: 'Vikram Sinha',
    email: 'vikram@brightweb.in',
    passwordHash,
    role: 'manager',
    organizationId: org._id,
    onboardingCompleted: true,
    avatar: null,
  });

  console.log('✅ Team created:', owner.email, salesRep.email, manager.email);

  // Create default follow-up sequence
  const sequence = await FollowUpSequence.create({
    organizationId: org._id,
    name: 'Default Follow-up Sequence',
    description: 'Standard follow-up sequence for new leads',
    isDefault: true,
    active: true,
    steps: [
      { stepNumber: 1, delay: 0, delayUnit: 'hours', name: 'Immediate response', useAI: true, requireApproval: true },
      { stepNumber: 2, delay: 24, delayUnit: 'hours', name: '24-hour follow-up', useAI: true, requireApproval: true },
      { stepNumber: 3, delay: 3, delayUnit: 'days', name: '3-day follow-up', useAI: true, requireApproval: true },
      { stepNumber: 4, delay: 6, delayUnit: 'days', name: 'Final follow-up', useAI: true, requireApproval: true },
    ],
  });

  // Define sample leads data
  const leadsData = [
    {
      contact: { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@dentalcare.in', phone: '+91 98760 11234', company: 'DentalCare Clinic', jobTitle: 'Owner' },
      lead: { source: 'website', status: 'qualified', estimatedValue: 120000, leadScore: 91, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.95, service: 'Website Development', timeline: '6 weeks', budget: { min: 80000, max: 150000, currency: 'INR' }, aiSummary: 'Rahul owns a dental clinic and wants a new website with online appointment booking and SEO. Budget appears to be ₹80k–₹1.5L. He wants to launch within 6 weeks.', recommendedAction: 'Send proposal today.', isQualified: true },
      messages: [
        { content: 'Hi, I need a website for my dental clinic. Can you tell me pricing?', direction: 'inbound', senderType: 'customer', daysAgo: 3 },
        { content: 'Hi Rahul! Absolutely, we specialize in dental clinic websites. We can build a modern site with online appointment booking, service pages, WhatsApp integration, and local SEO. Could you share a bit more about the number of pages and features you need? That will help me give you an accurate estimate.', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 3 },
        { content: 'I want around 8-10 pages. Appointment booking is must. Also want to show before-after photos of patients. Budget is around 1 lakh.', direction: 'inbound', senderType: 'customer', daysAgo: 2 },
        { content: 'Perfect, Rahul. With 8-10 pages, appointment booking, before-after gallery, and local SEO, we can deliver a complete dental website in 4-6 weeks. I\'ll send you a detailed proposal with pricing by tomorrow. Does that work?', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 2 },
        { content: 'Yes please. When can we start?', direction: 'inbound', senderType: 'customer', daysAgo: 1 },
      ],
      owner: owner._id,
    },
    {
      contact: { firstName: 'Priya', lastName: 'Mehta', email: 'priya@stylehub.in', phone: '+91 98760 22345', company: 'StyleHub Boutique', jobTitle: 'Founder' },
      lead: { source: 'instagram', status: 'proposal', estimatedValue: 85000, leadScore: 82, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.88, service: 'Social Media Marketing', timeline: '1 month', budget: { min: 60000, max: 100000, currency: 'INR' }, aiSummary: 'Priya runs a fashion boutique and wants social media marketing to boost Instagram sales. She has 15k followers and wants to grow to 50k. Budget around ₹60k-₹1L per month.', recommendedAction: 'Follow up on proposal — she opened it 2 times.', isQualified: true },
      messages: [
        { content: 'Hello! I saw your Instagram ad. I want to grow my boutique\'s Instagram from 15k to 50k followers. Can you help?', direction: 'inbound', senderType: 'customer', daysAgo: 5 },
        { content: 'Hi Priya! Yes, we can absolutely help StyleHub grow on Instagram. We\'ve helped fashion brands grow from 10k to 50k+ followers in 4-6 months using targeted content, reels, and influencer collaboration. Would you like to see some case studies?', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 5 },
        { content: 'Yes please! And what\'s your pricing?', direction: 'inbound', senderType: 'customer', daysAgo: 4 },
        { content: 'Our social media packages start at ₹25,000/month for content creation and ₹45,000/month for full management with ads. I\'ll send you our detailed proposal with case studies. What\'s your email?', direction: 'outbound', senderType: 'sales_rep', daysAgo: 4 },
        { content: 'priya@stylehub.in — please send it.', direction: 'inbound', senderType: 'customer', daysAgo: 3 },
      ],
      owner: salesRep._id,
    },
    {
      contact: { firstName: 'Amit', lastName: 'Kumar', email: 'amit@localsolar.in', phone: '+91 98760 33456', company: 'LocalSolar Energy', jobTitle: 'Director' },
      lead: { source: 'whatsapp', status: 'contacted', estimatedValue: 150000, leadScore: 64, leadTemperature: 'warm', intent: 'inquiry', intentConfidence: 0.65, service: 'Website Development', timeline: '3 months', budget: { min: 100000, max: 200000, currency: 'INR' }, aiSummary: 'Amit runs a solar energy company and wants a website to showcase their residential and commercial solar products. Also interested in Google Ads to generate leads.', recommendedAction: 'Send follow-up and ask for requirements document.' },
      messages: [
        { content: 'Hi, we are a solar energy company looking for a new website and some digital marketing. Can you call me?', direction: 'inbound', senderType: 'customer', daysAgo: 7 },
        { content: 'Hi Amit! Sure, I\'d love to connect. We help solar companies showcase their projects and generate quality leads through websites and Google Ads. What\'s a good time to call you today?', direction: 'outbound', senderType: 'sales_rep', daysAgo: 7 },
        { content: 'Call me after 5 PM', direction: 'inbound', senderType: 'customer', daysAgo: 6 },
      ],
      owner: manager._id,
    },
    {
      contact: { firstName: 'Neha', lastName: 'Joshi', email: 'neha@immigrationpro.in', phone: '+91 98760 44567', company: 'Immigration Pro', jobTitle: 'Consultant' },
      lead: { source: 'facebook', status: 'new', estimatedValue: 45000, leadScore: 55, leadTemperature: 'warm', intent: 'inquiry', intentConfidence: 0.55, service: 'SEO', timeline: '2 months', budget: { min: 30000, max: 60000, currency: 'INR' }, aiSummary: 'Neha is an immigration consultant looking to improve her website\'s Google ranking to get more Canada/Australia visa clients.' },
      messages: [
        { content: 'Hi, I want to rank my immigration consultancy website on first page of Google for "Canada visa consultant Delhi". Can you help?', direction: 'inbound', senderType: 'customer', daysAgo: 1 },
      ],
      owner: owner._id,
    },
    {
      contact: { firstName: 'Suresh', lastName: 'Pillai', email: 'suresh@coastalrealty.in', phone: '+91 98760 55678', company: 'Coastal Realty', jobTitle: 'Broker' },
      lead: { source: 'linkedin', status: 'won', estimatedValue: 95000, leadScore: 95, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.99, service: 'Website Development', timeline: '1 month', budget: { min: 80000, max: 120000, currency: 'INR' }, aiSummary: 'Suresh runs a real estate brokerage and needed a property listing website. Deal was won.', isQualified: true },
      messages: [
        { content: 'We need a property listing website with search filters. Budget is around 90k. Can start immediately.', direction: 'inbound', senderType: 'customer', daysAgo: 20 },
        { content: 'Hi Suresh! We can build exactly that. A modern real estate website with advanced property filters, WhatsApp integration, and agent profiles. We can start this week. Let\'s schedule a call?', direction: 'outbound', senderType: 'sales_rep', daysAgo: 20 },
        { content: 'Great. I\'m in.', direction: 'inbound', senderType: 'customer', daysAgo: 19 },
      ],
      owner: salesRep._id,
    },
    {
      contact: { firstName: 'Kavya', lastName: 'Reddy', email: 'kavya@eduprime.in', phone: '+91 98760 66789', company: 'EduPrime Coaching', jobTitle: 'Director' },
      lead: { source: 'google_forms', status: 'negotiation', estimatedValue: 72000, leadScore: 76, leadTemperature: 'hot', intent: 'purchase', intentConfidence: 0.82, service: 'Website Development', timeline: '5 weeks', budget: { min: 50000, max: 90000, currency: 'INR' }, aiSummary: 'Kavya runs a coaching center for competitive exams. She wants a website with course listings, online enrollment, and study material downloads.', recommendedAction: 'Finalize pricing — she is comparing with 2 other vendors.' },
      messages: [
        { content: 'I submitted the form on your website. We need a website for our coaching center. We have 5 courses for JEE, NEET, UPSC etc.', direction: 'inbound', senderType: 'customer', daysAgo: 8 },
        { content: 'Hi Kavya! We\'d love to build EduPrime\'s website. We can create a modern coaching center site with course listings, online enrollment, downloadable study materials, and student testimonials. What\'s your timeline?', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 8 },
        { content: 'We want to launch before the next batch starts — about 5 weeks. What\'s the cost?', direction: 'inbound', senderType: 'customer', daysAgo: 7 },
        { content: 'For the scope you\'ve described — courses, enrollment, materials — we can deliver in 4-5 weeks at ₹65,000-₹75,000. I\'ll send you a detailed scope document today.', direction: 'outbound', senderType: 'sales_rep', daysAgo: 7 },
        { content: 'Thanks. I\'m comparing with 2 others. Will let you know by Friday.', direction: 'inbound', senderType: 'customer', daysAgo: 3 },
      ],
      owner: owner._id,
    },
    {
      contact: { firstName: 'Rohit', lastName: 'Malhotra', email: 'rohit@interiorcraft.in', phone: '+91 98760 77890', company: 'Interior Craft', jobTitle: 'Principal Designer' },
      lead: { source: 'email', status: 'contacted', estimatedValue: 60000, leadScore: 48, leadTemperature: 'warm', intent: 'inquiry', intentConfidence: 0.5, service: 'Website Development', timeline: null, budget: { min: null, max: null, currency: 'INR' }, aiSummary: 'Rohit is an interior designer who wants to showcase his portfolio online. Budget and timeline not confirmed yet.' },
      messages: [
        { content: 'Hello, I need a portfolio website for my interior design business. I want to show my projects. How much does it cost?', direction: 'inbound', senderType: 'customer', daysAgo: 4 },
        { content: 'Hi Rohit! A professional interior design portfolio with project galleries, testimonials, and inquiry forms typically starts at ₹25,000. For a more complete site with 3D renders and video, it can go up to ₹60,000. What kind of projects do you mainly do?', direction: 'outbound', senderType: 'sales_rep', aiGenerated: true, daysAgo: 4 },
      ],
      owner: salesRep._id,
    },
    {
      contact: { firstName: 'Anjali', lastName: 'Singh', email: 'anjali@recruitpro.in', phone: '+91 98760 88901', company: 'RecruitPro', jobTitle: 'Managing Partner' },
      lead: { source: 'website', status: 'lost', estimatedValue: 35000, leadScore: 25, leadTemperature: 'cold', intent: 'research', intentConfidence: 0.3, service: 'Website Development', timeline: null, budget: { min: null, max: null, currency: 'INR' }, aiSummary: 'Anjali was researching prices for a recruitment agency website. Went cold after initial inquiry.' },
      messages: [
        { content: 'What is the price for a recruitment agency website?', direction: 'inbound', senderType: 'customer', daysAgo: 15 },
        { content: 'Hi Anjali, recruitment websites with job listings, candidate applications, and employer portal typically range from ₹30,000-₹55,000. Would you like to schedule a call to discuss your requirements?', direction: 'outbound', senderType: 'sales_rep', daysAgo: 15 },
      ],
      owner: manager._id,
    },
  ];

  // Create leads with contacts, conversations, and messages
  const createdLeads = [];

  for (const data of leadsData) {
    // Create contact
    const contact = await Contact.create({
      organizationId: org._id,
      ...data.contact,
      fullName: `${data.contact.firstName} ${data.contact.lastName}`,
      source: data.lead.source,
      tags: [],
    });

    // Create lead
    const now = new Date();
    const lead = await Lead.create({
      organizationId: org._id,
      contactId: contact._id,
      ownerId: data.owner,
      title: `${contact.fullName} — ${data.lead.service || 'Inquiry'}`,
      ...data.lead,
      tags: [],
      lastAnalyzedAt: now,
      lastContactAt: new Date(now - (data.messages.length > 0 ? data.messages[data.messages.length - 1].daysAgo * 86400000 : 7 * 86400000)),
      nextFollowUpAt: data.lead.status === 'new' ? new Date(now.getTime() + 24 * 3600000) : null,
      createdAt: new Date(now - 10 * 86400000),
    });

    // Create conversation
    const conversation = await Conversation.create({
      organizationId: org._id,
      leadId: lead._id,
      contactId: contact._id,
      channel: data.lead.source || 'website',
      status: ['won', 'lost'].includes(data.lead.status) ? 'closed' : 'open',
      lastMessageAt: new Date(now - data.messages[data.messages.length - 1].daysAgo * 86400000),
    });

    // Create messages
    for (const msg of data.messages) {
      await Message.create({
        organizationId: org._id,
        conversationId: conversation._id,
        leadId: lead._id,
        senderType: msg.senderType,
        senderId: msg.senderType === 'customer' ? contact._id : data.owner,
        direction: msg.direction,
        channel: data.lead.source || 'website',
        content: msg.content,
        aiGenerated: msg.aiGenerated || false,
        deliveryStatus: 'delivered',
        createdAt: new Date(now - msg.daysAgo * 86400000),
      });
    }

    // Create activities
    await Activity.create({
      organizationId: org._id,
      leadId: lead._id,
      contactId: contact._id,
      type: 'lead_created',
      title: `Lead created for ${contact.fullName}`,
      createdAt: new Date(now - 10 * 86400000),
    });

    await Activity.create({
      organizationId: org._id,
      leadId: lead._id,
      type: 'ai_analyzed',
      title: `AI analyzed lead — Score: ${data.lead.leadScore}, ${data.lead.leadTemperature?.toUpperCase()}`,
      metadata: { score: data.lead.leadScore, temperature: data.lead.leadTemperature },
    });

    createdLeads.push({ lead, contact, conversation });
  }

  console.log(`✅ Created ${createdLeads.length} leads with conversations`);

  // Create deals for won leads
  const wonLead = createdLeads.find((l) => l.lead.status === 'won');
  if (wonLead) {
    const deal = await Deal.create({
      organizationId: org._id,
      leadId: wonLead.lead._id,
      ownerId: salesRep._id,
      name: `${wonLead.contact.fullName} — Website Project`,
      value: wonLead.lead.estimatedValue,
      currency: 'INR',
      stage: 'won',
      probability: 100,
      wonAt: new Date(Date.now() - 2 * 86400000),
    });

    await Activity.create({
      organizationId: org._id,
      leadId: wonLead.lead._id,
      type: 'deal_won',
      title: `Deal won: ${deal.name} — ₹${deal.value.toLocaleString()}`,
      metadata: { dealId: deal._id, value: deal.value },
    });
  }

  // Create a deal in negotiation
  const negotiationLead = createdLeads.find((l) => l.lead.status === 'negotiation');
  if (negotiationLead) {
    await Deal.create({
      organizationId: org._id,
      leadId: negotiationLead.lead._id,
      ownerId: owner._id,
      name: `${negotiationLead.contact.fullName} — Coaching Website`,
      value: negotiationLead.lead.estimatedValue,
      currency: 'INR',
      stage: 'negotiation',
      probability: 70,
      expectedCloseDate: new Date(Date.now() + 7 * 86400000),
    });
  }

  // Create notifications for the owner
  await Notification.create([
    {
      organizationId: org._id,
      userId: owner._id,
      type: 'hot_lead',
      title: '🔥 Hot lead received!',
      message: 'Rahul Sharma from DentalCare has a lead score of 91. Act now!',
      read: false,
      link: '/leads',
    },
    {
      organizationId: org._id,
      userId: owner._id,
      type: 'customer_replied',
      title: '📩 Rahul Sharma replied',
      message: '"Yes please. When can we start?" — Qualify and send proposal.',
      read: false,
      link: '/leads',
    },
    {
      organizationId: org._id,
      userId: owner._id,
      type: 'followup_overdue',
      title: '⚠️ Follow-up overdue',
      message: 'Amit Kumar (LocalSolar) has been waiting 6 days without a follow-up.',
      read: true,
      link: '/followups',
    },
    {
      organizationId: org._id,
      userId: owner._id,
      type: 'deal_won',
      title: '🎉 Deal won!',
      message: 'Suresh Pillai\'s Coastal Realty project has been won. ₹95,000 added to revenue.',
      read: true,
      link: '/deals',
    },
  ]);

  // Create pending follow-up tasks for hot leads
  const hotLeads = createdLeads.filter((l) => 
    l.lead.leadTemperature === 'hot' && !['won', 'lost'].includes(l.lead.status)
  );

  for (const { lead } of hotLeads.slice(0, 3)) {
    await FollowUpTask.create({
      organizationId: org._id,
      leadId: lead._id,
      sequenceId: sequence._id,
      stepNumber: 2,
      type: 'auto_followup',
      scheduledAt: new Date(Date.now() + Math.random() * 8 * 3600000), // Within next 8 hours
      status: 'pending',
      aiGenerated: true,
    });
  }

  console.log('✅ Notifications and follow-up tasks created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Login Credentials:');
  console.log('  Email:    demo@followupos.com');
  console.log('  Password: Demo@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Organization: ${org.name}`);
  console.log(`Leads created: ${leadsData.length}`);
  console.log('Teams: Arjun Kapoor (owner), Sneha Patel (sales_rep), Vikram Sinha (manager)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
