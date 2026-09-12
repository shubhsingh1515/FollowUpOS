import { Link } from 'react-router-dom'
import {
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap,
  Bot, Clock, Layers, MessageSquare, Database, GitBranch,
  Search, Lock, CheckSquare, Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const ARCHITECTURE_STEPS = [
  {
    step: '01',
    title: 'Zero-Latency Multi-Channel Ingestion',
    subtitle: 'Webhooks, APIs, and direct channel listeners',
    desc: 'The moment a prospect clicks a Meta Ad, fills an embedded website widget, or sends a WhatsApp inquiry, FollowUpOS captures the raw payload in <3 seconds without data loss.',
    techBadges: ['Meta Lead Ads API', 'WhatsApp Cloud API', 'Webflow Webhooks', 'SMTP / Gmail Sync'],
    detailList: [
      'Automatic deduplication against existing database contacts',
      'Source attribution tagging & campaign ID extraction',
      'Immediate event dispatch to intent parsing engine',
    ],
  },
  {
    step: '02',
    title: 'Deterministic Intent & Sentiment Extraction',
    subtitle: 'Contextual NLP without hallucinations',
    desc: 'FollowUpOS parses requirement constraints, requested timelines, declared budgets, and tone to build a structured qualification profile before a human rep even opens the record.',
    techBadges: ['Custom Structured Outputs', 'Deterministic Logic', 'Budget Validation', 'Multi-Lingual / Hinglish'],
    detailList: [
      'Extracts declared budgets (₹50k - ₹10L+) against agency minimums',
      'Flags immediate buying urgency vs exploratory tire-kickers',
      'Calculates 0-100 AI Lead Score with explainable factor weights',
    ],
  },
  {
    step: '03',
    title: 'Human-in-the-Loop Action Recommendation',
    subtitle: 'Sales reps approve, edit, and dispatch in one click',
    desc: 'Instead of robotic auto-responders that annoy high-ticket buyers, FollowUpOS drafts context-aware consultative responses with objection rebuttals and scheduling links for instant rep approval.',
    techBadges: ['Rep Approval Guard', 'Tone Switcher', 'Rebuttal Injector', 'Meeting Link Generator'],
    detailList: [
      '5 one-click tone pills: Professional, Consultative, Persuasive, Shorten, Hinglish',
      'Detected objections (e.g. Price sensitivity) automatically paired with ROI counter-arguments',
      'Zero risk of unintended or embarrassing autonomous messages',
    ],
  },
  {
    step: '04',
    title: 'Autonomous Multi-Touch Cadence Engine',
    subtitle: 'Intelligent follow-up that knows when to stop',
    desc: 'If a lead doesn’t reply immediately, FollowUpOS schedules a gentle multi-channel cadence (Day +1, Day +3, Day +7). As soon as the prospect replies or books a discovery call, the sequence halts automatically.',
    techBadges: ['Auto-Pause Safeguard', 'Business Hours Guard', 'Multi-Channel Drips', 'Revival Workflows'],
    detailList: [
      'Auto-pauses instantly on inbound reply across WhatsApp, SMS, or Email',
      'Strict IST Business Hours (9 AM - 7 PM) compliance with weekend muting',
      '14-day cold lead revival workflows for dark opportunities',
    ],
  },
  {
    step: '05',
    title: 'Pipeline Velocity & Weighted Forecasts',
    subtitle: 'Real-time probability weighting and deal tracking',
    desc: 'Every scheduled discovery call advances through the 8-stage Kanban board, giving founders and sales managers clear visibility into active pipeline and weighted cash forecasts.',
    techBadges: ['8-Stage Kanban', 'Stage Win Probability', 'Deal Decay Monitor', 'Revenue at Risk'],
    detailList: [
      'Dynamic calculation: Deal Value × Stage Win Probability = Expected Revenue',
      'Real-time lead decay tracker highlighting stalled proposals',
      'Instant conversion analytics and channel ROI attribution',
    ],
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center max-w-4xl">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-xs font-mono font-semibold uppercase tracking-wider py-1 px-3">
            System Architecture & Flow
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            How FollowUpOS Executes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">From Lead to Close.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            A deep-dive technical look at our multi-channel ingestion, deterministic intent scoring, safe rep approval, and auto-pause cadence engines.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-10 px-6 rounded-full shadow-lg shadow-indigo-600/30">
                Deploy System Free <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" className="border border-white/20 bg-white/[0.05] text-white hover:bg-white/[0.12] hover:border-white/30 text-xs h-10 px-5 rounded-full transition-all">
                View Industry Solutions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Deep Dive Chapters */}
      <section className="py-16 relative bg-[#090B0F] border-t border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {ARCHITECTURE_STEPS.map((item, idx) => (
            <div
              key={item.step}
              className="p-8 sm:p-10 rounded-3xl border border-white/[0.08] bg-[#0E1118]/80 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-mono font-bold flex items-center justify-center text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono">{item.subtitle}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {item.techBadges.map((t, i) => (
                    <Badge key={i} variant="outline" className="bg-white/[0.02] text-zinc-400 border-white/[0.08] text-[10px] font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {item.desc}
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Engine Safeguards & Operations:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.detailList.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Compliance Principles */}
      <section className="py-24 relative bg-[#07080B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3 text-center mx-auto">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
              Safety First
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Strict Non-Destructive AI Execution.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto">
              FollowUpOS is built on strict safeguards to protect your brand reputation and client relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Human-in-the-Loop Safe Approval',
                desc: 'No AI messages are sent autonomously to high-ticket prospects without salesperson review or explicit workflow enrollment.',
              },
              {
                title: 'Instant Inbound Auto-Pause',
                desc: 'Automations halt the millisecond a prospect responds, eliminating robotic or awkward follow-ups during active conversations.',
              },
              {
                title: 'Tenant-Level Data Isolation',
                desc: 'Every organization’s leads, contact history, and custom tone rules are encrypted and completely isolated in multi-tenant boundaries.',
              },
            ].map((card, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="text-base font-bold text-white">{card.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
