import { useState } from 'react'
import {
  Sparkles, AlertTriangle, Clock, TrendingUp, CheckCircle2,
  ChevronRight, ArrowRight, Flame, ShieldAlert, CheckSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'

export default function TodayCockpitSection() {
  const [activeLead, setActiveLead] = useState(0)

  const priorityLeads = [
    {
      id: 'l1',
      name: 'Sarah Mitchell',
      company: 'Acme Digital Labs',
      score: 92,
      dealVal: 240000,
      reason: 'Price Sensitivity Objection Flagged',
      action: 'Send 3.4x ROI Rebuttal & Meeting Link',
      decayHours: '1.2h ago',
      channel: 'WhatsApp',
      temp: 'hot',
    },
    {
      id: 'l2',
      name: 'Rohan Mehta',
      company: 'Apex Global Logistics',
      score: 84,
      dealVal: 180000,
      reason: 'Proposal Sent > 48h Without Reply',
      action: 'Trigger Executive Decision Check Drip',
      decayHours: '3.4h ago',
      channel: 'Email',
      temp: 'hot',
    },
    {
      id: 'l3',
      name: 'Vikram Sethi',
      company: 'TechCorp SaaS',
      score: 76,
      dealVal: 320000,
      reason: 'High Budget (₹3.2L) Inquiry Inbound',
      action: 'Dispatch WhatsApp Qualification Schedule',
      decayHours: '42m ago',
      channel: 'WhatsApp',
      temp: 'warm',
    },
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0C10] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
              The Daily Cockpit
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Start Every Day Knowing Exactly What to Close.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              No more opening 50 browser tabs or wondering who to contact first. FollowUpOS organizes your day by deal value, urgency, and buying intent.
            </p>
          </div>
        </div>

        {/* Cockpit Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Morning Priority Queue */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Morning AI Priority Queue
                </span>
              </div>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px] font-mono">
                3 Urgent Actions
              </Badge>
            </div>

            <div className="space-y-3">
              {priorityLeads.map((lead, idx) => {
                const isSelected = activeLead === idx
                return (
                  <div
                    key={lead.id}
                    onClick={() => setActiveLead(idx)}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-200 cursor-pointer space-y-3',
                      isSelected
                        ? 'border-indigo-500/60 bg-indigo-950/20 shadow-xl ring-1 ring-indigo-500/40'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{lead.name}</span>
                            <span className="text-xs text-zinc-400">· {lead.company}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>Score: <strong className="text-white font-mono">{lead.score}/100</strong></span>
                            <span>•</span>
                            <span className="text-emerald-400">{formatCurrency(lead.dealVal, 'INR')}</span>
                            <span>•</span>
                            <span className="text-zinc-500">{lead.decayHours}</span>
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className={cn('text-[10px] font-mono', lead.temp === 'hot' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10')}>
                        {lead.temp.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium truncate pr-2">
                        {lead.action}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Revenue At Risk & Lead Decay Monitor */}
          <div className="lg:col-span-5 space-y-4">
            {/* Revenue at Risk Card */}
            <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/15 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Revenue at Risk
                </div>
                <Badge variant="outline" className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] font-mono">
                  3 Stalled Leads
                </Badge>
              </div>

              <div>
                <div className="text-3xl font-black font-mono text-white tracking-tight">
                  ₹4,50,000
                </div>
                <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
                  High-ticket opportunities stalling past optimal outreach SLAs. Expected deal probability drops by 14% every 24 hours without contact.
                </p>
              </div>

              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-xs font-mono text-rose-300">
                <span>Immediate Revival Recommended</span>
                <span className="font-bold underline cursor-pointer">Dispatch All</span>
              </div>
            </div>

            {/* Lead Decay Monitor */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Lead Velocity & Decay
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  Avg Speed: 1.8 mins
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { range: '< 5 Mins (Golden Window)', conversion: '78% Win Rate', width: 'w-full', color: 'bg-emerald-500' },
                  { range: '1 - 4 Hours', conversion: '42% Win Rate', width: 'w-3/5', color: 'bg-indigo-500' },
                  { range: '> 24 Hours (Decayed)', conversion: '11% Win Rate', width: 'w-1/5', color: 'bg-rose-500' },
                ].map((item, i) => (
                  <div key={i} className="p-2 rounded-lg bg-black/40 border border-white/[0.04] space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">{item.range}</span>
                      <span className="text-white font-bold">{item.conversion}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', item.color, item.width)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
