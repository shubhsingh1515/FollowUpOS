import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Sparkles, Zap, MessageSquare, ArrowRight, CheckCircle2,
  TrendingUp, Shield, BarChart3, Clock, Users, Flame, Star,
  ChevronRight, Play, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'capture' | 'score' | 'followup'>('followup')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              FollowUp<span className="text-indigo-600">OS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-sm">
                    Start Free Trial
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-radial from-indigo-500/10 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Sales Follow-up AI 2.0</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-muted-foreground font-normal">Now with WhatsApp Official API</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Never Lose Another Deal to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Slow Follow-Up</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            FollowUpOS captures inbound leads across WhatsApp, Email, Forms, and Socials, instantly analyzes buyer intent, and follows up autonomously until the deal is closed.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 h-12 shadow-lg shadow-indigo-500/25">
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6">
                <Play className="w-3.5 h-3.5 mr-2 text-indigo-600 fill-indigo-600" />
                Try Interactive Demo
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Setup in 2 minutes
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14-day trial
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Simulator */}
      <section id="demo" className="py-16 bg-muted/30 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Watch How FollowUpOS Closes Leads While You Sleep
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Experience the 3-step autonomous pipeline in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-card border rounded-xl p-6 shadow-sm relative space-y-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-semibold text-base">Instant Lead Ingestion</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prospect submits form on your website or sends a WhatsApp message at 11:42 PM.
              </p>
              <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono space-y-1">
                <div className="text-indigo-600 font-semibold">Inbound Lead: David Miller</div>
                <div className="text-muted-foreground">Budget: $15,000 | Urgency: Immediate</div>
                <div className="text-muted-foreground">Channel: Website Form & WhatsApp</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-card border-2 border-indigo-600 rounded-xl p-6 shadow-md relative space-y-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-semibold text-base flex items-center justify-between">
                <span>AI Intent Scoring</span>
                <Badge variant="destructive" className="text-[10px] gap-1">
                  <Flame className="w-3 h-3 fill-white" /> Hot (92/100)
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                LLM extracts key requirements, assigns urgency score, and detects service intent.
              </p>
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg text-xs space-y-1.5 border border-indigo-200 dark:border-indigo-900">
                <div className="flex justify-between font-medium text-indigo-900 dark:text-indigo-200">
                  <span>Buying Intent</span>
                  <span className="font-bold">92% High</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Persona match</span>
                  <span>Direct Decision Maker</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-card border rounded-xl p-6 shadow-sm relative space-y-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-semibold text-base">Autonomous Cadence</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sends personalized WhatsApp & Email in 90 seconds, then follows up on Day 2 & 4.
              </p>
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg text-xs border border-emerald-200 dark:border-emerald-900 space-y-1 text-emerald-900 dark:text-emerald-200">
                <div className="font-semibold">WhatsApp Dispatched:</div>
                <div className="italic text-[11px]">
                  "Hi David! Saw your note regarding the custom CRM rollout. Are you free for a 10-min intro tomorrow at 10 AM?"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Engineered Exclusively for High-Ticket Service Teams
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Everything you need to turn forgotten inquiries into booked calendar appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant 90-Second Response',
                desc: 'Engage incoming prospects while their buying intent is at its absolute peak, 24/7.',
              },
              {
                icon: MessageSquare,
                title: 'Omnichannel Ingestion',
                desc: 'Consolidate WhatsApp, Email, Instagram, Facebook Ads, and Google Forms into one stream.',
              },
              {
                icon: Flame,
                title: 'AI Lead Scoring & Sentiment',
                desc: 'Automatically categorize leads into Hot, Warm, or Cold so your reps focus on ready buyers.',
              },
              {
                icon: Clock,
                title: 'Smart Cadences with Auto-Pause',
                desc: 'Multi-touch sequences that immediately halt the millisecond a human customer replies.',
              },
              {
                icon: BarChart3,
                title: 'Kanban Sales Pipeline',
                desc: 'Drag and drop deals across stages, track weighted pipeline revenue, and forecast close dates.',
              },
              {
                icon: Shield,
                title: 'Enterprise Safety & Guardrails',
                desc: 'Custom quiet hours, approval workflows, and full human-in-the-loop overrides.',
              },
            ].map((f, idx) => (
              <div key={idx} className="p-6 rounded-xl border bg-card hover:border-indigo-500/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Double Your Follow-Up Conversion Rate?
          </h2>
          <p className="text-indigo-100 max-w-xl mx-auto text-sm">
            Join hundreds of service businesses and agencies automating their sales follow-up with FollowUpOS.
          </p>
          <div>
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-white/90 font-semibold px-8 h-12 shadow-xl">
                Get Started Free Today
                <ArrowRight className="w-4 h-4 ml-2 text-indigo-700" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-foreground">FollowUpOS</span>
            <span>© 2025. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <Link to="/login" className="hover:text-foreground">Login</Link>
            <Link to="/register" className="hover:text-foreground">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
