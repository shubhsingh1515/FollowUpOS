import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap,
  MessageSquare, Clock, Calendar, DollarSign, Bot, Flame,
  Check, ChevronDown, Building2, HelpCircle, Layers,
  ChevronRight, Play, Pause, RotateCcw, AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import HeroSimulation from '@/components/marketing/HeroSimulation'
import ExecutionLoopSection from '@/components/marketing/ExecutionLoopSection'
import TodayCockpitSection from '@/components/marketing/TodayCockpitSection'
import CopilotInteractiveSection from '@/components/marketing/CopilotInteractiveSection'
import { cn, formatCurrency } from '@/lib/utils'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const heroRef = useRef<HTMLDivElement>(null)

  const faqItems = [
    {
      q: 'How does FollowUpOS prevent robotic or embarrassing automated messages?',
      a: 'FollowUpOS follows a strict human-in-the-loop design. For high-ticket conversations, AI prepares personalized consultative drafts with relevant objection rebuttals and booking links, allowing the sales rep to approve, edit, or dispatch in one click. Automated drips also pause immediately the second a lead replies.',
    },
    {
      q: 'How fast does FollowUpOS ingest leads from Meta Ads and WhatsApp?',
      a: 'Inbound leads from Meta Lead Ads, WhatsApp Business API, and website widgets are captured in under 3 seconds via high-throughput webhooks, scored instantly, and routed to the salesperson morning queue.',
    },
    {
      q: 'What happens when a lead replies to an ongoing automated follow-up sequence?',
      a: 'The sequence auto-pauses instantly across all channels (WhatsApp, Email, SMS). FollowUpOS logs the response, notifies the assigned sales representative, and moves the deal into the active conversation queue so no duplicate or awkward automated messages ever go out.',
    },
    {
      q: 'Can we connect our own WhatsApp number and business email domain?',
      a: 'Yes. FollowUpOS supports official WhatsApp Cloud API, custom SMTP, Gmail/Google Workspace OAuth2, and Twilio for SMS, ensuring all messages come directly from your verified brand domain and phone number.',
    },
    {
      q: 'Does FollowUpOS support multi-lingual or Hinglish conversations for Indian clients?',
      a: 'Yes. FollowUpOS understands context in English, Hindi, and natural Hinglish commonly used by Indian businesses, extracting intent and generating professional consultative replies tailored to local sales culture.',
    },
    {
      q: 'Can I try FollowUpOS without connecting live customer data or entering a credit card?',
      a: 'Yes. You can explore our interactive workspace demo instantly with pre-populated leads, priority queues, and AI copilot queries with zero setup required.',
    },
  ]

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 999,
      priceAnnual: 799,
      desc: 'For solo operators, consultants, and boutique agencies.',
      features: [
        'Up to 500 Leads / month',
        '1,500 AI Follow-up Touches',
        'WhatsApp Inbound Webhook & Widget',
        'Deterministic Lead Intent Scoring',
        '2 Team Member Seats',
      ],
      popular: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      priceMonthly: 2999,
      priceAnnual: 2399,
      desc: 'For growing service agencies and consultancies needing multi-channel cadences.',
      features: [
        'Up to 2,500 Leads / month',
        '10,000 AI Follow-up Touches',
        'Official WhatsApp Cloud API + Email + SMS',
        'Salesperson Morning Briefing (/today)',
        'Sales Copilot Assistant (/copilot)',
        'Node Cadence Builder & Auto-Pause',
        '8-Stage Pipeline with Weighted Forecasts',
        '10 Team Member Seats',
      ],
      popular: true,
    },
    {
      id: 'agency',
      name: 'Agency & Scale',
      priceMonthly: 7999,
      priceAnnual: 6399,
      desc: 'For high-ticket service operations, multi-client accounts, and sales teams.',
      features: [
        'Up to 10,000 Leads / month',
        'Unlimited AI Copilot & Lead Scoring',
        'Multi-Client Workspace Sub-Accounts',
        'Custom Webhooks & CRM Sync',
        'Revenue at Risk & Lead Decay Monitor',
        '25 Team Member Seats',
        'Dedicated Solutions Architect',
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans antialiased overflow-x-hidden">
      {/* Floating Header */}
      <MarketingNavbar />

      {/* CHAPTER 01: HERO */}
      <section ref={heroRef} className="pt-32 pb-20 sm:pt-40 sm:pb-28 relative overflow-hidden bg-muted/30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          {/* Hero Content Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Sales Execution System</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08] sm:leading-[1.05]">
              Turn More Leads Into Customers — <span className="text-primary italic">Automatically.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              FollowUpOS helps sales teams understand every lead, prioritize the right conversations, respond in under 2 minutes, and automatically follow up until the deal moves forward.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-11 px-7 rounded-full shadow-lg gap-2 transition-all">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" className="border border-border bg-background hover:bg-muted text-foreground text-xs h-11 px-6 rounded-full font-semibold transition-all">
                  See How It Works
                </Button>
              </Link>
            </div>

            <p className="text-[11px] text-muted-foreground font-mono">
              No credit card required · Zero-setup live interactive workspace
            </p>
          </div>

          {/* Master Live Product Simulation */}
          <div className="max-w-5xl mx-auto pt-4">
            <HeroSimulation />
          </div>
        </div>
      </section>

      {/* CHAPTER 02: THE PROBLEM STATEMENT */}
      <section className="py-24 relative bg-background border-t border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200 text-xs font-mono font-semibold uppercase tracking-wider">
              The Real Problem
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Your problem isn't lead generation.<br />
              <span className="text-muted-foreground">It's what happens after the lead arrives.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Without FollowUpOS */}
            <div className="p-8 rounded-3xl border border-rose-200 bg-rose-50/50 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-rose-600 font-bold">
                  <span>WITHOUT FOLLOWUPOS</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  The Broken Manual Follow-up Trap
                </h3>
                <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Delayed Replies:</strong> Reps take 4+ hours to contact inbound WhatsApp & Ad leads.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Forgotten Opportunities:</strong> 68% of sales prospects never receive a 2nd follow-up.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Invisible Pipeline Loss:</strong> Stalled proposals quietly go dark without alerts.</span>
                  </li>
                </ul>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-xs font-mono text-rose-700 shadow-sm">
                Result: ~42% of marketing budget wasted on unclosed leads.
              </div>
            </div>

            {/* With FollowUpOS */}
            <div className="p-8 rounded-3xl border border-primary/30 bg-primary/5 space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-primary font-bold">
                  <span>WITH FOLLOWUPOS</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  High-Velocity Sales Execution
                </h3>
                <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Sub-2-Minute Triage:</strong> Immediate deterministic scoring and personalized WhatsApp drafts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Smart Multi-Touch Cadences:</strong> Autonomous follow-ups that automatically halt when leads reply.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Morning Priority Cockpit:</strong> Reps wake up to a prioritized list of high-intent deals to close.</span>
                  </li>
                </ul>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-primary/20 text-xs font-mono text-primary shadow-sm">
                Result: 3.4x higher lead-to-meeting conversion rate.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER 03: THE EXECUTION LOOP COMPONENT */}
      <ExecutionLoopSection />

      {/* CHAPTER 04: THE MORNING COCKPIT */}
      <TodayCockpitSection />

      {/* CHAPTER 05: SALES COPILOT PLAYGROUND */}
      <CopilotInteractiveSection />

      {/* CHAPTER 06: DEDICATED INDUSTRY SOLUTIONS PREVIEW */}
      <section className="py-24 relative bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-mono font-semibold uppercase tracking-wider">
                Industry Specifics
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                Built for High-Ticket Service Businesses.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Tailored playbooks and compliance standards built specifically for service-led growth.
              </p>
            </div>
            <Link to="/services">
              <Button variant="outline" className="border border-border bg-background text-foreground hover:bg-muted text-xs h-9 rounded-full px-4 gap-1.5 shrink-0 transition-all">
                View All Service Playbooks <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Digital Agencies', desc: 'Instant WhatsApp response for Meta ad traffic & price objection handling.', tag: 'Agency ROI' },
              { title: 'Consultancies', desc: 'Executive proposal check-ins & multi-stakeholder buying committee tracking.', tag: 'Enterprise' },
              { title: 'Real Estate Brokers', desc: 'Site visit scheduling, budget filtering, and automated weekend appointment sync.', tag: 'High-Ticket' },
              { title: 'Specialty Clinics', desc: 'Empathetic consultation booking with strict patient privacy compliance.', tag: 'Healthcare' },
            ].map((card, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card space-y-3 hover:border-primary/40 transition-all group flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono">
                    {card.tag}
                  </Badge>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
                <Link to="/services" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 pt-3 border-t border-border">
                  Learn more <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTER 07: TRANSPARENT COMMERCIAL PRICING */}
      <section className="py-24 relative bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-mono font-semibold uppercase tracking-wider">
              Commercial Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Predictable, Transparent Pricing.
            </h2>
            <p className="text-sm text-muted-foreground">
              No hidden fees, no credit card required to start, and 14 days full access.
            </p>

            <div className="pt-2 flex items-center justify-center gap-2">
              <div className="p-1 rounded-full bg-muted border border-border flex items-center text-xs font-semibold">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={cn('px-4 py-1.5 rounded-full transition-all', billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={cn('px-4 py-1.5 rounded-full transition-all flex items-center gap-1', billingCycle === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
                >
                  Annual <span className="text-[9px] text-primary-foreground font-mono bg-primary/20 px-1 rounded">Save 20%</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => {
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'p-8 rounded-3xl border flex flex-col justify-between transition-all duration-200 relative',
                    plan.popular
                      ? 'border-primary bg-primary/5 shadow-xl ring-1 ring-primary/50 scale-[1.02]'
                      : 'border-border bg-card shadow-sm'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground font-bold text-[10px] uppercase font-mono px-3 py-0.5">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                    </div>

                    <div className="pt-2 flex items-baseline gap-1 font-mono">
                      <span className="text-4xl font-black text-foreground">₹{price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>

                    <ul className="space-y-2.5 pt-4 border-t border-border text-xs text-muted-foreground">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-border mt-6">
                    <Link to="/register">
                      <Button className={cn('w-full text-xs font-bold h-10 rounded-xl', plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80')}>
                        Start Free Trial
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CHAPTER 08: HONEST FREQUENTLY ASKED QUESTIONS */}
      <section className="py-24 relative bg-muted/20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Clear answers to technical, functional, and operational questions.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="p-5 rounded-2xl border border-border bg-card cursor-pointer transition-all hover:border-primary/30"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-bold text-foreground">{item.q}</h4>
                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', isOpen && 'rotate-180')} />
                  </div>
                  {isOpen && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed pt-3 border-t border-border animate-fade-in">
                      {item.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <MarketingFooter />
    </div>
  )
}
