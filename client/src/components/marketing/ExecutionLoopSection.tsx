import { useState } from 'react'
import {
  ArrowRight, CheckCircle2, Sparkles, MessageSquare, Clock,
  Calendar, DollarSign, Bot, ShieldCheck, Zap, Flame, Target
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const LOOP_STAGES = [
  {
    id: 'ingest',
    num: '01',
    title: 'Multi-Channel Ingestion',
    subtitle: 'Sub-3-second capture',
    desc: 'Captures leads instantaneously from WhatsApp Business, Meta Lead Ads, Google Forms, Website Widgets, Email, and Zapier without data loss.',
    badge: 'Universal Webhook',
    color: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    meta: 'WhatsApp · Ads · Forms · Mail',
  },
  {
    id: 'understand',
    num: '02',
    title: 'Semantic Understanding',
    subtitle: 'Deterministic intent extraction',
    desc: 'Parses requirement text, budget limits, urgency, decision-makers, and industry specifics with 94%+ model precision.',
    badge: 'Intent NLP',
    color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400',
    meta: 'Budget ₹1.5L–₹5L · Kickoff <14d',
  },
  {
    id: 'score',
    num: '03',
    title: 'Lead Prioritization',
    subtitle: '0–100 Explainable Score',
    desc: 'Ranks prospects dynamically so sales reps never waste time on low-intent inquiries while hot opportunities stall.',
    badge: 'AI Lead Score',
    color: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
    meta: 'Hot (85+) · Warm (60+) · Cold',
  },
  {
    id: 'action',
    num: '04',
    title: 'Next Best Action',
    subtitle: 'Human-in-the-loop guidance',
    desc: 'Recommends whether to call, send a consultative WhatsApp note, share a specific case study, or address an objection.',
    badge: 'Action Dispatch',
    color: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    meta: 'Tone: Consultative · Hinglish',
  },
  {
    id: 'cadence',
    num: '05',
    title: 'Smart Cadence Drips',
    subtitle: 'Auto-pause on response',
    desc: 'Multi-touch sequences across WhatsApp and Email that automatically halt the second a prospect replies or books a slot.',
    badge: 'Auto-Pause Guard',
    color: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    meta: 'Day 0 → Day 1 → Day 3 → Day 7',
  },
  {
    id: 'revenue',
    num: '06',
    title: 'Closed Deals & Revenue',
    subtitle: 'Weighted pipeline velocity',
    desc: 'Discovery meetings convert into signed contracts with real-time deal stage tracking and weighted revenue forecasting.',
    badge: '3.4x ROI',
    color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    meta: 'Deal Value × Stage Win %',
  },
]

export default function ExecutionLoopSection() {
  const [activeStage, setActiveStage] = useState(0)

  return (
    <section className="py-24 relative overflow-hidden bg-[#08090D] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
            Execution Loop
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            From Inbound Signal to Banked Revenue.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            FollowUpOS doesn't just store contacts like a static database. It orchestrates every step between lead arrival and closing.
          </p>
        </div>

        {/* Interactive Horizontal Progression Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LOOP_STAGES.map((stage, idx) => {
            const isSelected = activeStage === idx
            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                className={cn(
                  'p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative group flex flex-col justify-between',
                  isSelected
                    ? 'border-indigo-500/60 bg-gradient-to-b from-indigo-950/20 to-black/60 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      STEP {stage.num}
                    </span>
                    <Badge variant="outline" className={cn('text-[10px] font-mono', stage.color)}>
                      {stage.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {stage.title}
                    </h3>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      {stage.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span className="truncate">{stage.meta}</span>
                  <ArrowRight className={cn('w-3.5 h-3.5 transition-transform', isSelected ? 'text-indigo-400 translate-x-1' : 'text-zinc-600')} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
