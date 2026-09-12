import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, CheckCircle2, ArrowRight, Building2, TrendingUp,
  ShieldCheck, Clock, Zap, Target, DollarSign, Calculator,
  Layers, Users, HeartPulse, Briefcase, HelpCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { cn, formatCurrency } from '@/lib/utils'

const SERVICES_SOLUTIONS = [
  {
    id: 'agencies',
    icon: Zap,
    title: 'Performance & Creative Agencies',
    subtitle: 'High lead volume from Meta & Google Ads',
    heroTag: 'Max Lead Velocity',
    problem: 'Agencies spend thousands on lead ads, but reps take 4+ hours to reply—by which time the prospect has clicked on 3 other competitor ads.',
    solution: 'FollowUpOS ingests ad leads in <3 seconds via WhatsApp Webhook, deterministically scores buying intent, and prompts reps with instant personalized WhatsApp drafts.',
    benefits: [
      'Sub-2-minute instant WhatsApp response time',
      'Automated price-objection rebuttal injection',
      'Multi-touch follow-up sequence across WhatsApp & Email',
      'Seamless attribution to ad campaigns and channels',
    ],
    sampleDeal: 'Average Retainer: ₹1,50,000 / month',
    roi: '3.8x ROI within 45 days',
  },
  {
    id: 'consultancies',
    icon: Briefcase,
    title: 'Management & Tech Consultancies',
    subtitle: 'High-ticket advisory & enterprise proposals',
    heroTag: 'High-Ticket Qualification',
    problem: 'Consulting proposals stall for weeks in client review committees. Sales directors forget to check in at critical decision milestones.',
    solution: 'Deterministic milestone cadences gently re-engage executive sponsors with benchmark reports, case studies, and friendly decision checks.',
    benefits: [
      'Multi-stakeholder buying committee tracking',
      'Executive-tone follow-up email drafts',
      'Quarterly cold lead revival cadences',
      'Weighted revenue forecast based on proposal age',
    ],
    sampleDeal: 'Average Engagement: ₹5,00,000 - ₹25,00,000',
    roi: '4.5x ROI across quarterly cohorts',
  },
  {
    id: 'realestate',
    icon: Building2,
    title: 'Real Estate & Luxury Brokers',
    subtitle: 'Site visit scheduling & buyer qualification',
    heroTag: 'Zero Lead Decay',
    problem: 'Property buyers browse multiple listings simultaneously. Delayed responses mean lost site visits and commission leakage.',
    solution: 'Instant AI qualification filters genuine high-budget buyers, confirms location preferences, and auto-schedules weekend site visits.',
    benefits: [
      'Automated site visit booking and calendar sync',
      'Budget and property tier pre-qualification',
      'Pre-visit WhatsApp reminder with Google Maps link',
      'Zero lead loss over weekend inquiry spikes',
    ],
    sampleDeal: 'Average Commission: ₹3,00,000 - ₹15,00,000',
    roi: '5.2x ROI on ad spend',
  },
  {
    id: 'healthcare',
    icon: HeartPulse,
    title: 'Specialty Clinics & Elective Healthcare',
    subtitle: 'Consultation scheduling & patient inquiries',
    heroTag: 'Empathetic Triage',
    problem: 'Prospective patients inquiring about elective treatments need reassuring, timely consultation scheduling without sounding robotic.',
    solution: 'Empathetic, privacy-first conversational workflows that address common treatment questions and secure doctor consultation slots.',
    benefits: [
      'Empathetic, consultative messaging tone',
      'Instant slot booking with doctor availability',
      'Pre-consultation intake form automation',
      'Strict SOC2 & data protection compliance',
    ],
    sampleDeal: 'Treatment Value: ₹75,000 - ₹4,00,000',
    roi: '3.4x appointment booking rate',
  },
]

export default function ServicesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState(0)
  
  // Interactive ROI Calculator State
  const [monthlyLeads, setMonthlyLeads] = useState(150)
  const [avgDealValue, setAvgDealValue] = useState(120000)
  const [currentResponseHours, setCurrentResponseHours] = useState(6)

  // Calculator logic
  const calculatedMetrics = useMemo(() => {
    // Slower response leads to higher decay (e.g. 5% decay per hour past 1hr)
    const estimatedLossPercent = Math.min(65, Math.round(currentResponseHours * 6.5))
    const totalPipeline = monthlyLeads * avgDealValue
    const lostRevenueToDelay = Math.round(totalPipeline * (estimatedLossPercent / 100) * 0.15)
    const recoveredRevenueWithFollowUp = Math.round(lostRevenueToDelay * 0.45)
    const roiMultiple = ((recoveredRevenueWithFollowUp / 2999) / 12).toFixed(1)

    return {
      estimatedLossPercent,
      totalPipeline,
      lostRevenueToDelay,
      recoveredRevenueWithFollowUp,
      roiMultiple: Math.max(3.2, parseFloat(roiMultiple)),
    }
  }, [monthlyLeads, avgDealValue, currentResponseHours])

  const currentInd = SERVICES_SOLUTIONS[selectedIndustry]

  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center max-w-4xl">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-xs font-mono font-semibold uppercase tracking-wider py-1 px-3">
            Tailored Industry Solutions
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Engineered for High-Ticket Businesses Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">Every Lead Matters.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Explore dedicated sales execution playbooks designed specifically for service agencies, consultancies, brokers, and clinics.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-10 px-6 rounded-full shadow-lg shadow-indigo-600/30">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="border border-white/20 bg-white/[0.05] text-white hover:bg-white/[0.12] hover:border-white/30 text-xs h-10 px-5 rounded-full transition-all">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Industry Solutions Switcher */}
      <section className="py-16 relative bg-[#090B0F] border-t border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {SERVICES_SOLUTIONS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setSelectedIndustry(idx)}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-semibold transition-all border flex items-center gap-2',
                  selectedIndustry === idx
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-white/[0.02] text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/[0.15]'
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          {/* Selected Industry Card Showcase */}
          <div className="p-8 sm:p-12 rounded-3xl border border-white/[0.1] bg-[#0E1118]/90 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-xs font-mono font-semibold">
                  {currentInd.heroTag}
                </Badge>
                <span className="text-xs text-zinc-500 font-mono">· {currentInd.sampleDeal}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentInd.title}
              </h2>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 leading-relaxed">
                  <strong className="text-rose-400">The Problem:</strong> {currentInd.problem}
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                  <strong className="text-indigo-400">FollowUpOS Solution:</strong> {currentInd.solution}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Key Capabilities Delivered:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentInd.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: ROI & Impact Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-white/[0.1] bg-black/40 space-y-4">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                Verified Outcome Metrics
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <div className="text-xs text-emerald-400 font-mono font-semibold">Target Impact</div>
                <div className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentInd.roi}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Based on sub-2-minute response times and automated follow-up cadence triggers.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Average Setup Time</span>
                  <span className="text-white font-bold">&lt; 15 Minutes</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Supported Channels</span>
                  <span className="text-indigo-400 font-bold">WhatsApp, Email, Ads, Forms</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Data Isolation</span>
                  <span className="text-emerald-400 font-bold">Tenant-Encrypted</span>
                </div>
              </div>

              <Link to="/register" className="block pt-2">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-9 rounded-xl">
                  Deploy for {currentInd.title.split(' ')[0]}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI & Revenue Leakage Calculator */}
      <section className="py-24 relative overflow-hidden bg-[#07080B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
              Revenue Leakage Simulator
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Calculate What Delayed Follow-ups Cost You.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Every hour a prospect waits for a reply reduces win rates by up to 14%. See how much stalled revenue FollowUpOS can recover for your team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Input Sliders */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-white/[0.02] space-y-6">
              {/* Slider 1: Monthly Leads */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-bold">Monthly Inbound Leads</span>
                  <span className="text-indigo-400 font-bold text-sm">{monthlyLeads} Leads / mo</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Slider 2: Average Deal Value */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-bold">Average Deal / Retainer Value</span>
                  <span className="text-emerald-400 font-bold text-sm">{formatCurrency(avgDealValue, 'INR')}</span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="1000000"
                  step="25000"
                  value={avgDealValue}
                  onChange={(e) => setAvgDealValue(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Slider 3: Current Response Time */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-bold">Current Sales Response Delay</span>
                  <span className="text-amber-400 font-bold text-sm">{currentResponseHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={currentResponseHours}
                  onChange={(e) => setCurrentResponseHours(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-zinc-400 font-mono flex items-center justify-between">
                <span>Total Active Pipeline Under Review:</span>
                <span className="text-white font-bold">{formatCurrency(calculatedMetrics.totalPipeline, 'INR')} / mo</span>
              </div>
            </div>

            {/* Right: Output Calculation Card */}
            <div className="lg:col-span-5 p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-black/60 shadow-2xl space-y-5">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                Projected Recovery Assessment
              </div>

              <div>
                <span className="text-xs text-zinc-400 font-mono">Recoverable Monthly Revenue:</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight mt-1">
                  +{formatCurrency(calculatedMetrics.recoveredRevenueWithFollowUp, 'INR')}
                </div>
                <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
                  ~ {Math.round(calculatedMetrics.recoveredRevenueWithFollowUp / avgDealValue)} additional closed deal(s) per month
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Current Lead Decay Loss:</span>
                  <span className="text-rose-400 font-bold">~{calculatedMetrics.estimatedLossPercent}% drop</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Estimated FollowUpOS ROI:</span>
                  <span className="text-indigo-300 font-bold">{calculatedMetrics.roiMultiple}x Return</span>
                </div>
              </div>

              <Link to="/register" className="block pt-2">
                <Button className="w-full bg-white text-black hover:bg-zinc-200 text-xs font-bold h-10 rounded-xl shadow-lg">
                  Start Recovering Pipeline Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
