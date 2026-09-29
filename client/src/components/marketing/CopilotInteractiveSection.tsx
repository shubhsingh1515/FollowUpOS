import { useState } from 'react'
import {
  Bot, Sparkles, Send, ArrowRight, User, CheckCircle2,
  Calendar, Flame, TrendingUp, MessageSquare, DollarSign,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PROMPT_PRESETS = [
  {
    label: 'Which leads need follow up today?',
    answer: 'You have 3 high-priority leads requiring immediate contact before noon: Sarah Mitchell (Score 92 · Price Objection), Rohan Mehta (Score 84 · Proposal check-in), and Vikram Sethi (Score 76 · Inbound inquiry). Total pipeline value represented: ₹7,40,000.',
    meta: '3 Actionable Opportunities',
  },
  {
    label: 'Draft a personalized reply for Sarah Mitchell',
    answer: '"Hi Sarah, thanks for reaching out regarding our agency setup. Rather than cutting core scope, our clients typically see a 3.4x ROI within 60 days which covers the ₹2.4L investment. Would tomorrow at 11:30 AM IST work for a 10-minute discovery call?"',
    meta: 'Rebuttal Included · Ready to send',
  },
  {
    label: 'Show deals likely to close this month',
    answer: 'Based on proposal engagement metrics and WhatsApp responsiveness, 2 deals are in the final closing stage: Acme Digital Labs (₹2.4L · 85% probability) and TechStartup India (₹1.2L · 90% probability). Projected banked revenue: ₹3,12,000.',
    meta: 'Weighted Forecast: ₹3.12L',
  },
  {
    label: 'Explain why Vikram\'s score is 76/100',
    answer: '+25 High budget match (₹3.2L), +20 WhatsApp responsiveness within 4 mins, +15 Kickoff timeline < 14d, -5 Missing secondary finance decision-maker on the invite. Recommendation: Request alignment call with founder + CFO.',
    meta: 'Score Breakdown · Factor Weights',
  },
]

export default function CopilotInteractiveSection() {
  const [selectedPrompt, setSelectedPrompt] = useState(0)
  const current = PROMPT_PRESETS[selectedPrompt]

  return (
    <section className="py-24 relative overflow-hidden bg-muted/20 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-mono font-semibold uppercase tracking-wider">
            AI Sales Copilot
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Your Sales Team Just Got a Second Brain.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Ask complex questions about your pipeline, extract deal insights, generate multi-lingual follow-up drafts, and forecast revenue with natural language.
          </p>
        </div>

        {/* Interactive Chat Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Suggested Prompts List */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Try Interactive Prompts
            </span>
            <div className="space-y-2">
              {PROMPT_PRESETS.map((p, idx) => {
                const isSelected = selectedPrompt === idx
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedPrompt(idx)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border text-xs transition-all duration-200 flex items-center justify-between gap-3',
                      isSelected
                        ? 'border-purple-300 bg-purple-50 text-foreground font-semibold shadow-sm ring-1 ring-purple-200'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-purple-200 hover:bg-muted'
                    )}
                  >
                    <span className="truncate">{p.label}</span>
                    <ArrowRight className={cn('w-3.5 h-3.5 shrink-0 transition-transform', isSelected ? 'text-purple-600 translate-x-1' : 'text-muted-foreground')} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Copilot Response Stream Visualizer */}
          <div className="lg:col-span-8 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
            {/* User Message Bubble */}
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-lg p-3.5 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground text-xs font-medium shadow-sm leading-relaxed">
                {current.label}
              </div>
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 border border-border">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* AI Copilot Response Bubble */}
            <div className="flex items-start gap-3 justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm border border-purple-200">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-xl p-4 rounded-2xl rounded-tl-sm bg-muted/50 border border-border text-foreground text-xs leading-relaxed space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] font-mono text-purple-700">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> FollowUpOS Copilot Intelligence</span>
                  <Badge variant="outline" className="text-[9px] bg-purple-100 text-purple-700 border-purple-200">
                    {current.meta}
                  </Badge>
                </div>

                <p className="text-foreground font-sans leading-relaxed">
                  {current.answer}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] h-7 px-3 rounded-lg shadow-sm">
                    Execute Recommended Action
                  </Button>
                  <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted text-[11px] h-7 px-3 rounded-lg">
                    Copy Response
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
