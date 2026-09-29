import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check, Sparkles, ArrowRight, ShieldCheck, Zap, HelpCircle,
  TrendingUp, CreditCard, Building2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { cn } from '@/lib/utils'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 999,
      priceAnnual: 799,
      tagline: 'For solo consultants, freelancers, and boutique agencies.',
      features: [
        'Up to 500 Leads / month',
        '1,500 AI Follow-up Touches',
        'WhatsApp Inbound Webhook & Widget',
        'Deterministic Lead Intent Scoring',
        '2 Team Member Seats',
        'Standard Email Support',
        'CSV Export & Sync',
      ],
      highlight: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: 'Most Popular',
      priceMonthly: 2999,
      priceAnnual: 2399,
      tagline: 'For growing service agencies and consultancies needing multi-channel cadences.',
      features: [
        'Up to 2,500 Leads / month',
        '10,000 AI Follow-up Touches',
        'Official WhatsApp Cloud API + Email + SMS',
        'Salesperson Morning Briefing (/today)',
        'Natural Language Sales Copilot (/copilot)',
        'Node-based Cadence Builder & Auto-Pause',
        '8-Stage Pipeline with Weighted Forecasts',
        '10 Team Member Seats',
        'Priority Slack & WhatsApp Support',
      ],
      highlight: true,
    },
    {
      id: 'agency',
      name: 'Agency & Scale',
      priceMonthly: 7999,
      priceAnnual: 6399,
      tagline: 'For high-ticket service operations, multi-client accounts, and sales teams.',
      features: [
        'Up to 10,000 Leads / month',
        'Unlimited AI Copilot & Lead Scoring',
        'Multi-Client Workspace Sub-Accounts',
        'Custom Webhooks, Zapier & Bi-Directional CRM Sync',
        'Revenue at Risk & Lead Decay Monitor',
        '25 Team Member Seats & Role Permissions',
        'Dedicated Solutions Architect',
        '99.9% Uptime SLA Guarantee',
      ],
      highlight: false,
    },
  ]

  const featureMatrix = [
    { category: 'Lead Ingestion & Volume', items: [
      { name: 'Monthly Inbound Leads', starter: '500', growth: '2,500', agency: '10,000+' },
      { name: 'WhatsApp Cloud API Sync', starter: 'Webhook Only', growth: 'Official Cloud API', agency: 'Dedicated BSP / Cloud' },
      { name: 'Meta Lead Ads & Google Forms Ingestion', starter: '✓', growth: '✓', agency: '✓' },
      { name: 'Embeddable Web Widget Generator', starter: '✓', growth: '✓', agency: '✓' },
    ]},
    { category: 'AI Intelligence & Intent', items: [
      { name: 'Explainable AI Lead Scoring (0-100)', starter: 'Standard', growth: 'Deep Factor Weights', agency: 'Custom Intent Weights' },
      { name: 'AI Objection Detection & Rebuttal Injection', starter: '—', growth: '✓', agency: '✓' },
      { name: 'Sales Copilot Natural Language Assistant', starter: '—', growth: '✓', agency: 'Unlimited' },
      { name: 'Morning Sales Cockpit (/today)', starter: '—', growth: '✓', agency: '✓' },
    ]},
    { category: 'Follow-Up Automations', items: [
      { name: 'Autonomous Multi-Touch Cadences', starter: 'Single Step', growth: 'Multi-Step Node Builder', agency: 'Unlimited Workflows' },
      { name: 'Instant Inbound Auto-Pause Safeguard', starter: '✓', growth: '✓', agency: '✓' },
      { name: 'Strict Business Hours & Weekend Muting', starter: '✓', growth: '✓', agency: '✓' },
      { name: '14-Day Cold Lead Revival Workflows', starter: '—', growth: '✓', agency: '✓' },
    ]},
    { category: 'Team & Governance', items: [
      { name: 'Team Member Seats Included', starter: '2 Seats', growth: '10 Seats', agency: '25 Seats' },
      { name: 'GST Compliant Invoices & Input Credit', starter: '✓', growth: '✓', agency: '✓' },
      { name: 'Multi-Client Sub-Accounts', starter: '—', growth: '—', agency: '✓' },
      { name: 'Support SLA', starter: 'Email (24h)', growth: 'Priority Slack / WA (2h)', agency: 'Dedicated Account Manager' },
    ]},
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans antialiased">
      <MarketingNavbar />

      {/* Hero Header */}
      <section className="pt-36 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center max-w-3xl">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-semibold uppercase tracking-wider py-1 px-3">
            Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Fair, Outcome-Driven Plans for <span className="text-primary italic">Scaling Teams.</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Choose a plan that matches your monthly lead volume. All plans include automated safeguards and zero setup fees.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <div className="p-1 rounded-full bg-muted border border-border flex items-center gap-1 text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'px-4 py-1.5 rounded-full font-semibold transition-all',
                  billingCycle === 'monthly' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  'px-4 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5',
                  billingCycle === 'annual' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Annual Billing <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] py-0 px-1 font-mono">Save 20%</Badge>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-12 relative bg-muted/30 border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative',
                    plan.highlight
                      ? 'border-primary bg-primary/5 shadow-xl ring-1 ring-primary/20 scale-[1.02]'
                      : 'border-border bg-card shadow-sm hover:border-primary/30'
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground font-bold text-[10px] uppercase font-mono px-3 py-0.5 tracking-wider shadow-sm">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">{plan.tagline}</p>
                    </div>

                    <div className="pt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-black font-mono text-foreground tracking-tight">
                        ₹{price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">/ month</span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                        Included Features:
                      </span>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/80">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border mt-6">
                    <Link to="/register">
                      <Button
                        className={cn(
                          'w-full text-xs font-bold h-10 rounded-xl transition-all shadow-sm',
                          plan.highlight
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
                        )}
                      >
                        Start 14-Day Free Trial
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-24 relative bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Detailed Feature Matrix
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Compare capabilities, limits, and team seats across all tiers.
            </p>
          </div>

          <div className="overflow-x-auto border border-border rounded-3xl bg-card shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 sm:p-5 text-muted-foreground font-mono uppercase tracking-wider w-2/5">Capability</th>
                  <th className="p-4 sm:p-5 text-foreground font-bold font-mono">Starter</th>
                  <th className="p-4 sm:p-5 text-primary font-bold font-mono">Growth</th>
                  <th className="p-4 sm:p-5 text-foreground font-bold font-mono">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {featureMatrix.map((section, sIdx) => (
                  <>
                    <tr key={sIdx} className="bg-muted">
                      <td colSpan={4} className="p-3.5 px-5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                        {section.category}
                      </td>
                    </tr>
                    {section.items.map((item, iIdx) => (
                      <tr key={iIdx} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4 px-5 text-foreground/80 font-medium">{item.name}</td>
                        <td className="p-4 text-muted-foreground font-mono">{item.starter}</td>
                        <td className="p-4 text-primary font-mono font-semibold">{item.growth}</td>
                        <td className="p-4 text-muted-foreground font-mono">{item.agency}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
