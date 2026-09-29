import { useState, useEffect, useRef } from 'react'
import {
  Sparkles, CheckCircle2, MessageSquare, Play, Pause, RotateCcw,
  ArrowRight, ShieldCheck, Clock, Calendar, Zap, DollarSign, Bot,
  Flame, Check, AlertCircle, CheckSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn, formatCurrency } from '@/lib/utils'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

export default function HeroSimulation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isPlaying, setIsPlaying] = useState(true)
  const [scoreVal, setScoreVal] = useState(0)
  const intervalRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const steps = [
    { num: 1, label: 'Lead Ingested', detail: 'WhatsApp Cloud Webhook' },
    { num: 2, label: 'AI Scored (92)', detail: 'High Intent + ₹2.4L Budget' },
    { num: 3, label: 'Next Action', detail: 'Discovery Call Strategy' },
    { num: 4, label: 'Reply Drafted', detail: 'Personalized Rebuttal' },
    { num: 5, label: 'Cadence Set', detail: 'Auto Multi-touch Drips' },
    { num: 6, label: 'Lead Replied', detail: 'Inbound Response Caught' },
    { num: 7, label: 'Auto-Paused', detail: 'Safeguard Activated' },
    { num: 8, label: 'Meeting Booked', detail: '₹2.4L Deal Won' },
  ]

  // Step advancement timer loop
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => (prev >= 8 ? 1 : prev + 1))
    }, 4500)

    return () => clearInterval(intervalRef.current)
  }, [isPlaying])

  // GSAP score animation on Step 2
  useEffect(() => {
    if (currentStep >= 2) {
      if (prefersReducedMotion()) {
        setScoreVal(92)
        return
      }
      const obj = { val: 0 }
      gsap.to(obj, {
        val: 92,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => setScoreVal(Math.round(obj.val)),
      })
    } else {
      setScoreVal(0)
    }
  }, [currentStep])

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-border bg-card shadow-lg overflow-hidden transition-all duration-300"
    >
      {/* Simulation Browser Header */}
      <div className="h-11 bg-muted/50 border-b border-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-muted-foreground font-mono ml-2 hidden sm:inline">
            FollowUpOS — Live Sales Execution Simulator
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs flex items-center gap-1"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="text-[10px] font-mono">{isPlaying ? 'Live' : 'Paused'}</span>
          </button>
          <button
            onClick={() => {
              setCurrentStep(1)
              setIsPlaying(true)
            }}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Restart Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step Pills Bar */}
      <div className="bg-background border-b border-border p-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => {
              setCurrentStep(s.num)
              setIsPlaying(false)
            }}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all shrink-0 flex items-center gap-1.5 border',
              currentStep === s.num
                ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold scale-[1.02]'
                : currentStep > s.num
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
            )}
          >
            <span className="w-4 h-4 rounded-full bg-background flex items-center justify-center text-[9px] font-bold border border-border">
              {currentStep > s.num ? '✓' : s.num}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Simulation Stage Body */}
      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[460px] items-center">
        {/* Left Column: Lead & Conversation Context */}
        <div className="lg:col-span-6 space-y-4">
          {/* Lead Card */}
          <div className="p-4 rounded-xl border border-border bg-background space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-sm">
                  SM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    Sarah Mitchell
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-mono">
                      WhatsApp Inbound
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground">Head of Growth · Acme Digital Labs</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">Just now</span>
            </div>

            <div className="p-3 rounded-lg bg-muted border border-border text-xs text-foreground font-sans leading-relaxed">
              "Hi team! We're reviewing agency partners for an enterprise CRM & sales automation overhaul this quarter. Looking to kick off immediately with ₹2.4L budget."
            </div>
          </div>

          {/* Dynamic Conversation Stream */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Live Channel Feed (WhatsApp)
            </div>

            {currentStep >= 4 && (
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 animate-slide-up">
                <div className="flex items-center justify-between text-[10px] text-primary font-mono">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Consultative Reply (Approved by Rep)</span>
                  <span>Sent 10:14 AM</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  "Hi Sarah, thanks for reaching out! We've automated high-ticket funnels for similar agencies with 3.4x ROI. Are you free for a quick 10-minute discovery call tomorrow at 11:30 AM IST?"
                </p>
              </div>
            )}

            {currentStep >= 6 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 animate-slide-up">
                <div className="flex items-center justify-between text-[10px] text-emerald-700 font-mono">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Inbound Prospect Reply</span>
                  <span>Received 10:18 AM</span>
                </div>
                <p className="text-xs text-foreground font-semibold">
                  "Tomorrow 11:30 AM IST works perfectly for our team! Let's lock it in."
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Intelligence & Automation Safeguard Panel */}
        <div className="lg:col-span-6 space-y-4">
          {/* AI Intelligence Card */}
          <div className="p-4 sm:p-5 rounded-xl border border-border bg-background space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  FollowUpOS AI Engine
                </span>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                Deterministic Qualification
              </Badge>
            </div>

            {/* Score & Factors */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black font-mono text-foreground tracking-tight">
                  {scoreVal}
                  <span className="text-xs text-muted-foreground font-normal">/100</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600" /> HOT PRIORITY
                  </div>
                  <div className="text-[10px] text-muted-foreground">94.2% AI Confidence</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-muted-foreground">Deal Value</span>
                <div className="text-sm font-bold text-foreground">₹2,40,000</div>
              </div>
            </div>

            {/* Step-by-Step AI Execution Status */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Execution State
              </div>

              {currentStep < 5 && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-foreground">
                    <strong>Strategy Recommended:</strong> Offer immediate discovery call & send case study on agency ROI.
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-700 flex items-start gap-2 animate-fade-in">
                  <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-foreground">
                    <strong>Multi-touch Cadence Queued:</strong> Drip #1 tomorrow 10:00 AM IST if unreplied.
                  </div>
                </div>
              )}

              {currentStep >= 7 && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-slide-up">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-foreground">
                    <strong>Auto-Pause Triggered:</strong> Cadence halted immediately because lead responded. Zero spam guaranteed.
                  </div>
                </div>
              )}

              {currentStep === 8 && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground flex items-center justify-between animate-slide-up">
                  <div className="flex items-center gap-2 font-semibold">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Discovery Call: Tomorrow · 11:30 AM IST</span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground font-bold text-[10px]">
                    STAGE → WON
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
