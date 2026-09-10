import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Sparkles, Zap, MessageSquare, ArrowRight, CheckCircle2,
  TrendingUp, Shield, BarChart3, Clock, Users, Flame, Star,
  ChevronRight, Play, Check, HelpCircle, Bot, Building2,
  Lock, Globe, Phone, FileText, ChevronDown, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Interactive Miniature Hero Simulation state
  const [simStep, setSimStep] = useState<number>(0)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const simulationSteps = [
    {
      badge: '01. Inbound Lead Arrives',
      title: 'WhatsApp Message Received at 11:42 PM',
      leadName: 'Sarah Jenkins',
      leadCompany: 'Acme Digital Agency',
      channel: 'WhatsApp',
      content: '"Hi! We are losing leads on our website and need automated WhatsApp follow-ups. Budget is ₹2.5L. Can we get started this month?"',
      actionTitle: 'AI Ingestion Engine',
      actionDetail: 'Lead captured, verified, and parsed in 1.2 seconds without manual entry.',
    },
    {
      badge: '02. AI Intent & Urgency Analysis',
      title: 'Score Calculated: 92 / 100 (Hot)',
      leadName: 'Sarah Jenkins',
      leadCompany: 'Acme Digital Agency',
      channel: 'WhatsApp',
      content: 'Intent: High Purchase Intent • Budget: ₹2,00,000 – ₹3,00,000 • Timeline: This Month (Urgent) • Decision Maker: Direct Founder',
      actionTitle: 'Recommendation Engine',
      actionDetail: 'AI recommends immediate response with discovery meeting booking link.',
    },
    {
      badge: '03. Autonomous Follow-up Dispatched',
      title: 'WhatsApp Reply Sent in 85 Seconds',
      leadName: 'Sarah Jenkins',
      leadCompany: 'Acme Digital Agency',
      channel: 'WhatsApp',
      content: '"Hi Sarah! Thanks for reaching out to FollowUpOS. We specialize in automated WhatsApp follow-up workflows for digital agencies. Are you free for a 15-min discovery call tomorrow at 11:30 AM?"',
      actionTitle: 'Smart Cadence Scheduled',
      actionDetail: 'Day 2 & Day 4 follow-ups scheduled (will auto-pause the moment Sarah replies).',
    },
    {
      badge: '04. Meeting Booked & Deal Won',
      title: 'Calendar Discovery Confirmed • ₹2,50,000 Deal Won',
      leadName: 'Sarah Jenkins',
      leadCompany: 'Acme Digital Agency',
      channel: 'WhatsApp',
      content: '"Sarah accepted Google Meet invitation for tomorrow 11:30 AM. Deal moved to Won. Cadence paused automatically."',
      actionTitle: 'Revenue Attributed',
      actionDetail: '₹2,50,000 added to closed-won revenue in Analytics.',
    },
  ]

  const faqs = [
    {
      q: 'What is FollowUpOS?',
      a: 'FollowUpOS is an AI sales execution platform for service businesses. It captures inbound leads across WhatsApp, website forms, Meta Ads, and email, analyzes buyer intent, and follows up autonomously so no deal slips through the cracks.',
    },
    {
      q: 'Who is FollowUpOS built for?',
      a: 'It is built specifically for service businesses and high-ticket agencies where every lead matters: digital marketing agencies, consultants, real estate teams, educational consultancies, recruitment agencies, and B2B service firms.',
    },
    {
      q: 'Does it work with official WhatsApp?',
      a: 'Yes. FollowUpOS integrates exclusively with official Meta WhatsApp Business Cloud APIs. We never scrape WhatsApp Web or use unauthorized tools, ensuring 100% account safety.',
    },
    {
      q: 'Can I connect my website forms?',
      a: 'Yes. You can use our embeddable lead capture widget, copy our 1-click universal webhook into WordPress, Webflow, Zapier, or Make, or connect via Google Forms.',
    },
    {
      q: 'Can AI automatically reply, or can I require approval?',
      a: 'You have complete control. The default mode is "Approval Required" where sales reps review and approve AI messages with 1 click. You can also enable fully autonomous follow-ups once you feel confident.',
    },
    {
      q: 'Does FollowUpOS replace my CRM?',
      a: 'FollowUpOS includes a built-in Kanban pipeline, contact memory, and conversation inbox. It acts as an active AI execution layer that does the actual follow-up work traditional passive CRMs leave to salespeople.',
    },
    {
      q: 'Can my whole sales team use it?',
      a: 'Yes. You can invite team members with role-based permissions (Owner, Admin, Sales Rep), assign leads, track response times, and monitor close rates on the Team Leaderboard.',
    },
    {
      q: 'How does billing work?',
      a: 'We offer straightforward monthly and annual plans in INR starting at ₹999/month for solo operators up to ₹7,999/month for agencies. You can upgrade, downgrade, or cancel at any time.',
    },
    {
      q: 'Is my data secure and isolated?',
      a: 'Yes. Every organization has strict multi-tenant data isolation. Your customer conversations and lead data are never shared or used to train third-party public models.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. There are no lock-in contracts or cancellation penalties. If you cancel, your account remains active until the end of your billing cycle.',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">
              FollowUp<span className="text-indigo-600">OS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-muted-foreground">
            <a href="#workflow" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#copilot" className="hover:text-foreground transition-colors">AI Copilot</a>
            <a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/today')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4">
                Open Workspace
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs h-9">
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4 shadow-xs">
                    Start Free
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 border-b border-border/40 overflow-hidden bg-radial from-indigo-500/5 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Sales Execution Platform</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-muted-foreground font-normal">Official WhatsApp API + Omnichannel</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
            Turn More Leads Into Customers — <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Automatically.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            FollowUpOS captures every lead, understands buying intent, follows up at the right time, and helps your team close more deals — without letting promising leads fall through the cracks.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 shadow-sm text-sm">
                Start Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#simulator" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 text-sm">
                <Play className="w-3.5 h-3.5 mr-2 text-indigo-600 fill-indigo-600" />
                See How It Works
              </Button>
            </a>
          </div>

          <div className="mt-5 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 14-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 2-minute setup
            </span>
          </div>
        </div>

        {/* 3. HERO MINIATURE LIVE UI WORKFLOW SIMULATOR */}
        <div id="simulator" className="max-w-4xl mx-auto px-4 mt-14">
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="text-xs font-mono text-muted-foreground ml-2">FollowUpOS Live Execution Simulator</span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Step {simStep + 1} of 4
              </span>
            </div>

            {/* Stepper buttons */}
            <div className="grid grid-cols-4 border-b border-border bg-muted/20 text-xs font-medium">
              {simulationSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setSimStep(idx)}
                  className={`p-3 text-center border-r last:border-r-0 transition-colors ${
                    simStep === idx
                      ? 'bg-background text-indigo-600 font-bold border-b-2 border-b-indigo-600'
                      : 'text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="hidden sm:inline">{step.badge.split('.')[0]}.</span> {step.badge.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* Simulation card body */}
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-xs font-mono text-indigo-600 mb-1">
                    {simulationSteps[simStep].badge}
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground">
                    {simulationSteps[simStep].title}
                  </h3>
                </div>
                <Badge className="bg-emerald-600 text-white text-xs">
                  {simulationSteps[simStep].channel}
                </Badge>
              </div>

              {/* Message Box */}
              <div className="p-4 rounded-xl border bg-muted/30 font-mono text-xs leading-relaxed text-foreground">
                {simulationSteps[simStep].content}
              </div>

              {/* Action Taken row */}
              <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">
                    {simulationSteps[simStep].actionTitle}:
                  </span>{' '}
                  <span className="text-muted-foreground">
                    {simulationSteps[simStep].actionDetail}
                  </span>
                </div>
                <button
                  onClick={() => setSimStep((prev) => (prev + 1) % simulationSteps.length)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 shrink-0 ml-3 flex items-center gap-1"
                >
                  Next Step <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT WORKFLOW STRIP */}
      <div className="border-b border-border/50 py-6 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-muted-foreground">
          <span className="text-foreground">Lead Received</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-foreground">AI Understands</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-foreground">Lead Scored</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-foreground">Reply Suggested</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-foreground">Follow-up Scheduled</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-foreground">Meeting Booked</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-indigo-600 font-bold">Deal Won 🏆</span>
        </div>
      </div>

      {/* 5. CATEGORY & TRUST BAR */}
      <section className="py-10 border-b border-border/40 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-5">
            Built for service businesses where every inbound lead matters
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm font-semibold text-foreground/80">
            <span>Digital Agencies</span>
            <span>•</span>
            <span>Consultancies</span>
            <span>•</span>
            <span>Real Estate Teams</span>
            <span>•</span>
            <span>Immigration & Education</span>
            <span>•</span>
            <span>Recruitment Firms</span>
            <span>•</span>
            <span>B2B Services</span>
          </div>
        </div>
      </section>

      {/* 6. PROBLEM SECTION */}
      <section className="py-20 border-b border-border/40 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Your problem isn't lead generation. It's what happens after the lead arrives.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-3">
              Businesses lose up to 68% of inbound revenue not from lack of inquiries, but from slow response times and forgotten follow-ups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Leads arrive while your team is busy', desc: 'Prospective clients inquiry at night or during meetings, and go cold before anyone responds.' },
              { title: 'Sales reps forget follow-ups', desc: 'Prospects say "call me next Tuesday" or "send details", and conversations disappear into chat history.' },
              { title: 'Hot prospects go cold', desc: 'Without consistent multi-touch follow-ups, ready buyers sign with the competitor who replied first.' },
              { title: 'Conversations scattered across channels', desc: 'Inquiries sit across WhatsApp, email, Instagram DMs, and form spreadsheets with zero visibility.' },
            ].map((p, idx) => (
              <div key={idx} className="p-5 rounded-xl border bg-card space-y-1.5">
                <div className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {p.title}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 text-center">
            <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200">
              FollowUpOS fixes the gap between lead generation and revenue.
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl mx-auto">
              It doesn't just store your contacts like a passive database. It actively pushes sales conversations forward to booked discovery calls.
            </p>
          </div>
        </div>
      </section>

      {/* 7. WORKFLOW 01 - 06 */}
      <section id="workflow" className="py-20 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              The 6-Step Sales Execution Engine
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              From the initial visitor inquiry to closed-won revenue in your bank account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Capture Omnichannel', desc: 'Ingest leads instantly from WhatsApp, website forms, Meta Lead ads, Instagram, and email into one unified queue.' },
              { num: '02', title: 'Understand Buyer Intent', desc: 'AI extracts requirements, budget ranges, decision-maker authority, and timeline urgency in seconds.' },
              { num: '03', title: 'Prioritize Ready Buyers', desc: 'AI scores leads from 0 to 100 and classifies prospects into Hot, Warm, or Cold so reps focus on revenue.' },
              { num: '04', title: 'Respond in 90 Seconds', desc: 'Generate consultative, personalized responses crafted specifically to address the prospect requirements.' },
              { num: '05', title: 'Automated Follow-ups', desc: 'Deploy intelligent multi-touch cadences across channels that automatically stop the instant the lead replies.' },
              { num: '06', title: 'Close & Forecast', desc: 'Track deals through visual Kanban stages with weighted revenue forecasting and source attribution.' },
            ].map((step, idx) => (
              <div key={idx} className="p-6 rounded-xl border bg-card space-y-2 relative">
                <span className="text-2xl font-extrabold text-indigo-600/30 font-mono">{step.num}</span>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. "AI THAT KNOWS WHAT TO DO NEXT" */}
      <section className="py-20 border-b border-border/40 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Don't just know which leads are hot. Know what to do next.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              FollowUpOS continuously inspects conversation history and tells your sales team the exact next move.
            </p>
          </div>

          {/* AI Recommendation Showcase Panel */}
          <div className="max-w-2xl mx-auto rounded-xl border border-indigo-200 dark:border-indigo-800 bg-card p-6 shadow-md space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">AI Sales Recommendation</h3>
                  <p className="text-[11px] text-muted-foreground">High-intent buyer detected • Priya Sharma (TechStartup India)</p>
                </div>
              </div>
              <Badge variant="destructive" className="text-[10px]">
                Score: 92/100
              </Badge>
            </div>

            <div className="p-3.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 text-xs text-foreground space-y-1.5 border border-indigo-100 dark:border-indigo-900">
              <div className="font-semibold text-indigo-900 dark:text-indigo-200">
                Priya is asking about pricing and wants to start this month.
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Key Needs: E-commerce redesign, abandoned cart WhatsApp recovery • Budget: ₹1.2L+ confirmed.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <span className="text-muted-foreground text-[11px]">
                Recommended action: <strong className="text-foreground">Reply within 10 mins & offer discovery call</strong>
              </span>
              <div className="flex gap-2">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
                  Generate Reply
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  Schedule Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. COPILOT SHOWCASE */}
      <section id="copilot" className="py-20 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-500/30">
              <Bot className="w-3.5 h-3.5 mr-1" /> FollowUpOS Copilot
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              An AI Sales Assistant that knows your entire pipeline.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Sales reps and founders can ask natural language questions and receive structured, actionable answers without digging through spreadsheets.
            </p>
            <ul className="space-y-2 text-xs text-foreground/90 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> "Which leads should I contact today?"
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> "Show me hot leads that haven't been followed up with."
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> "Draft a persuasive follow-up to this objection."
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> "Show me opportunities likely to close this month."
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-md space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-muted-foreground border-b pb-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Copilot Query Console</span>
            </div>
            <div className="p-2.5 rounded bg-muted/50 text-foreground font-sans text-xs">
              <span className="text-indigo-600 font-semibold">You:</span> "Show me opportunities likely to close this month."
            </div>
            <div className="p-3 rounded bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-1.5 font-sans text-xs">
              <div className="font-bold text-foreground">3 deals have 70%+ close probability:</div>
              <div className="text-muted-foreground text-[11px] space-y-1">
                <div>• Beacon Health Partners (₹4,50,000) — Negotiation (85%)</div>
                <div>• Apex Global Logistics (₹2,40,000) — Proposal (70%)</div>
                <div>• TechStartup India (₹1,20,000) — Qualified (60%)</div>
              </div>
              <div className="pt-1 font-bold text-indigo-600 text-xs">
                Total weighted revenue forecast: ₹6,22,500
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. INTEGRATIONS MARKETPLACE STRIP */}
      <section id="integrations" className="py-16 border-b border-border/40 bg-muted/20 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Connects With Your Inbound Lead Channels
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Zero engineering required. Start receiving leads via webhook or native integration in minutes.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            {['Official WhatsApp', 'Website Forms', 'Meta Lead Ads', 'Instagram Direct', 'Calendly', 'Google Forms'].map((c, i) => (
              <div key={i} className="p-3 rounded-lg border bg-card font-medium text-foreground">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. PRICING SECTION */}
      <section id="pricing" className="py-20 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Predictable Pricing Built for Growing Sales Teams
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Recover just one forgotten deal per month and FollowUpOS pays for itself 10x over.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="rounded-xl border bg-card p-6 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-base font-bold">Starter</h3>
                <p className="text-xs text-muted-foreground mt-1">For solo operators and boutique service consultants.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">₹999</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 100 leads / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> AI Intent Scoring (0–100)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> 1 Team Seat</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Email & Form Capture</li>
                </ul>
              </div>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full text-xs">Start 14-Day Free Trial</Button>
              </Link>
            </div>

            {/* Growth Plan (Most Popular) */}
            <div className="rounded-xl border-2 border-indigo-600 bg-card p-6 flex flex-col justify-between space-y-6 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase">
                Most Popular
              </div>
              <div>
                <h3 className="text-base font-bold">Growth</h3>
                <p className="text-xs text-muted-foreground mt-1">For growing sales teams and digital agencies.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">₹2,999</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="mt-6 space-y-2 text-xs text-foreground font-medium">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Up to 1,000 leads / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Official WhatsApp Business API</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> FollowUpOS AI Copilot</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> 5 Team Seats with SLA tracking</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Automated Smart Cadences</li>
                </ul>
              </div>
              <Link to="/login" className="w-full">
                <Button className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white">Start 14-Day Free Trial</Button>
              </Link>
            </div>

            {/* Agency Plan */}
            <div className="rounded-xl border bg-card p-6 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-base font-bold">Agency</h3>
                <p className="text-xs text-muted-foreground mt-1">For established agencies, high-ticket brokers, and sales teams.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">₹7,999</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 5,000 leads / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> 15 Team Member Seats</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Visual Automation Builder V2</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Custom SLA & Dedicated Manager</li>
                </ul>
              </div>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full text-xs">Start 14-Day Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ SECTION */}
      <section id="faq" className="py-20 border-b border-border/40 bg-muted/20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Honest, clear answers about how FollowUpOS works.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-xl border bg-card p-4 transition-colors cursor-pointer"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-foreground">
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isOpen && (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 pt-2 border-t">
                      {item.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 13. FINAL CTA */}
      <section className="py-20 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-5">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Every lead deserves a follow-up.
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
            Stop letting valuable opportunities disappear into unread messages, forgotten tasks, and spreadsheets.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-white/90 font-bold px-8 h-12">
                Start Free 14-Day Trial
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-12 px-6">
                Try Live Interactive Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="py-10 border-t border-border/50 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-foreground">FollowUpOS</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#workflow" className="hover:text-foreground">How It Works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <Link to="/login" className="hover:text-foreground">Login</Link>
            <Link to="/login" className="hover:text-foreground">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
