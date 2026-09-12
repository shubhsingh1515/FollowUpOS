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
      className="relative rounded-2xl border border-white/[0.12] bg-[#0E1017]/90 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300"
    >
      {/* Simulation Browser Header */}
      <div className="h-11 bg-white/[0.03] border-b border-white/[0.08] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-[11px] text-zinc-400 font-mono ml-2 hidden sm:inline">
            FollowUpOS — Live Sales Execution Simulator
          </span>
        </div>

        {/* Step Progress Controller */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1"
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
            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Restart Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step Pills Bar */}
      <div className="bg-black/40 border-b border-white/[0.06] p-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
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
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 font-semibold scale-[1.02]'
                : currentStep > s.num
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                : 'bg-white/[0.02] text-zinc-500 border-white/[0.05] hover:text-zinc-300'
            )}
          >
            <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[9px] font-bold">
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
          <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                  SM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Sarah Mitchell
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-mono">
                      WhatsApp Inbound
                    </Badge>
                  </h4>
                  <p className="text-xs text-zinc-400">Head of Growth · Acme Digital Labs</p>
                </div>
              </div>
              <span className="text-xs text-zinc-500 font-mono">Just now</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] text-xs text-zinc-300 font-sans leading-relaxed">
              "Hi team! We're reviewing agency partners for an enterprise CRM & sales automation overhaul this quarter. Looking to kick off immediately with ₹2.4L budget."
            </div>
          </div>

          {/* Dynamic Conversation Stream */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Live Channel Feed (WhatsApp)
            </div>

            {currentStep >= 4 && (
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5 animate-slide-up">
                <div className="flex items-center justify-between text-[10px] text-indigo-400 font-mono">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Consultative Reply (Approved by Rep)</span>
                  <span>Sent 10:14 AM</span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  "Hi Sarah, thanks for reaching out! We've automated high-ticket funnels for similar agencies with 3.4x ROI. Are you free for a quick 10-minute discovery call tomorrow at 11:30 AM IST?"
                </p>
              </div>
            )}

            {currentStep >= 6 && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5 animate-slide-up">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Inbound Prospect Reply</span>
                  <span>Received 10:18 AM</span>
                </div>
                <p className="text-xs text-white font-semibold">
                  "Tomorrow 11:30 AM IST works perfectly for our team! Let's lock it in."
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Intelligence & Automation Safeguard Panel */}
        <div className="lg:col-span-6 space-y-4">
          {/* AI Intelligence Card */}
          <div className="p-4 sm:p-5 rounded-xl border border-white/[0.1] bg-black/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  FollowUpOS AI Engine
                </span>
              </div>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px]">
                Deterministic Qualification
              </Badge>
            </div>

            {/* Score & Factors */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black font-mono text-white tracking-tight">
                  {scoreVal}
                  <span className="text-xs text-zinc-500 font-normal">/100</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> HOT PRIORITY
                  </div>
                  <div className="text-[10px] text-zinc-400">94.2% AI Confidence</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-zinc-400">Deal Value</span>
                <div className="text-sm font-bold text-white">₹2,40,000</div>
              </div>
            </div>

            {/* Step-by-Step AI Execution Status */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                Execution State
              </div>

              {currentStep < 5 && (
                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Strategy Recommended:</strong> Offer immediate discovery call & send case study on agency ROI.
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2 animate-fade-in">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Multi-touch Cadence Queued:</strong> Drip #1 tomorrow 10:00 AM IST if unreplied.
                  </div>
                </div>
              )}

              {currentStep >= 7 && (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2 animate-slide-up">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Auto-Pause Triggered:</strong> Cadence halted immediately because lead responded. Zero spam guaranteed.
                  </div>
                </div>
              )}

              {currentStep === 8 && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-950/40 to-indigo-950/40 border border-emerald-400/40 text-xs text-white flex items-center justify-between animate-slide-up">
                  <div className="flex items-center gap-2 font-semibold">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Discovery Call: Tomorrow · 11:30 AM IST</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
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
