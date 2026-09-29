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
    <section className="py-24 relative overflow-hidden bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono font-semibold uppercase tracking-wider">
              The Daily Cockpit
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Start Every Day Knowing Exactly What to Close.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              No more opening 50 browser tabs or wondering who to contact first. FollowUpOS organizes your day by deal value, urgency, and buying intent.
            </p>
          </div>
        </div>

        {/* Cockpit Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Morning Priority Queue */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  Morning AI Priority Queue
                </span>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono">
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
                        ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-muted'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-sm">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{lead.name}</span>
                            <span className="text-xs text-muted-foreground">· {lead.company}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                            <span>Score: <strong className="text-foreground font-mono">{lead.score}/100</strong></span>
                            <span>•</span>
                            <span className="text-emerald-600">{formatCurrency(lead.dealVal, 'INR')}</span>
                            <span>•</span>
                            <span className="text-muted-foreground">{lead.decayHours}</span>
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className={cn('text-[10px] font-mono', lead.temp === 'hot' ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-amber-600 border-amber-200 bg-amber-50')}>
                        {lead.temp.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium truncate pr-2">
                        {lead.action}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Revenue At Risk & Lead Decay Monitor */}
          <div className="lg:col-span-5 space-y-4">
            {/* Revenue at Risk Card */}
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Revenue at Risk
                </div>
                <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-mono">
                  3 Stalled Leads
                </Badge>
              </div>

              <div>
                <div className="text-3xl font-black font-mono text-foreground tracking-tight">
                  ₹4,50,000
                </div>
                <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">
                  High-ticket opportunities stalling past optimal outreach SLAs. Expected deal probability drops by 14% every 24 hours without contact.
                </p>
              </div>

              <div className="pt-2 border-t border-rose-200 flex items-center justify-between text-xs font-mono text-rose-700">
                <span>Immediate Revival Recommended</span>
                <span className="font-bold underline cursor-pointer">Dispatch All</span>
              </div>
            </div>

            {/* Lead Decay Monitor */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Lead Velocity & Decay
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                  Avg Speed: 1.8 mins
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { range: '< 5 Mins (Golden Window)', conversion: '78% Win Rate', width: 'w-full', color: 'bg-emerald-500' },
                  { range: '1 - 4 Hours', conversion: '42% Win Rate', width: 'w-3/5', color: 'bg-primary' },
                  { range: '> 24 Hours (Decayed)', conversion: '11% Win Rate', width: 'w-1/5', color: 'bg-rose-500' },
                ].map((item, i) => (
                  <div key={i} className="p-2 rounded-lg bg-muted border border-border space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">{item.range}</span>
                      <span className="text-foreground font-bold">{item.conversion}</span>
                    </div>
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50">
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
