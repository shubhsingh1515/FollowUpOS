import { useState } from 'react'
import {
  CreditCard, Check, Sparkles, Zap, ShieldCheck, ArrowRight,
  TrendingUp, Users, MessageSquare, Download, AlertTriangle,
  Receipt, Building2, Smartphone, CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

export default function BillingPage() {
  const { organization } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<string | null>(null)

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 999,
      priceAnnual: 799,
      description: 'Perfect for boutique service agencies, freelancers, and solo consultants starting automated follow-ups.',
      features: [
        'Up to 500 Leads / month',
        '1,500 AI Follow-up Touches',
        'WhatsApp Webhook & Inbound Widget',
        'Deterministic Lead Intent Scoring',
        '2 Team Member Seats',
        'Standard Email Support',
      ],
      current: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: 'Most Popular',
      priceMonthly: 2999,
      priceAnnual: 2399,
      description: 'For scaling service businesses, marketing agencies, and consultancies needing multi-channel cadences.',
      features: [
        'Up to 2,500 Leads / month',
        '10,000 AI Follow-up Touches',
        'Official WhatsApp Cloud API + Email + SMS',
        'Salesperson Morning Briefing & AI Copilot',
        'Visual Node Cadence Builder & Auto-pause',
        'Pipeline Stage Probability Forecasting',
        '10 Team Member Seats',
        'Priority Slack & WhatsApp Support',
      ],
      current: true,
    },
    {
      id: 'agency',
      name: 'Agency & Scale',
      priceMonthly: 7999,
      priceAnnual: 6399,
      description: 'For high-ticket service operations, multiple client accounts, and enterprise sales teams.',
      features: [
        'Up to 10,000 Leads / month',
        'Unlimited AI Copilot & Lead Scoring',
        'Multi-client Workspace Sub-accounts',
        'Custom Webhooks, Zapier & CRM Bi-directional Sync',
        'Revenue at Risk & Lead Decay Monitor',
        '25 Team Member Seats & Role Permissions',
        'Dedicated Solutions Architect',
        '99.9% Uptime SLA Guarantee',
      ],
      current: false,
    },
  ]

  const invoices = [
    { id: 'INV-2025-002', date: 'Feb 01, 2025', amount: '₹2,999.00', status: 'Paid', method: 'UPI / HDFC' },
    { id: 'INV-2025-001', date: 'Jan 01, 2025', amount: '₹2,999.00', status: 'Paid', method: 'UPI / HDFC' },
    { id: 'INV-2024-012', date: 'Dec 01, 2024', amount: '₹2,999.00', status: 'Paid', method: 'Corporate Card' },
  ]

  // Mock quota status (simulating 84% lead consumption for warning demo)
  const quota = {
    leadsUsed: 2110,
    leadsMax: 2500,
    aiMessagesUsed: 4200,
    aiMessagesMax: 10000,
    seatsUsed: 4,
    seatsMax: 10,
  }

  const leadsPercent = Math.round((quota.leadsUsed / quota.leadsMax) * 100)

  return (
    <div className="p-4 lg:p-6 animate-fade-in space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-500" />
            Billing, Quotas & Plans
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent INR pricing tailored for Indian service businesses and global agencies.
          </p>
        </div>

        {/* Monthly / Annual billing toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl text-xs self-start border border-border/60">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-all',
              billingCycle === 'monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5',
              billingCycle === 'annual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Annual <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Quota 80% Warning Banner */}
      {leadsPercent >= 80 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-xs sm:text-sm">Usage Alert: You have utilized {leadsPercent}% of your monthly lead allowance.</span>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                {quota.leadsMax - quota.leadsUsed} leads remaining in this billing cycle. Upgrade to Agency tier to ensure zero lead capture disruptions.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSelectedPlanForUpgrade('Agency & Scale')
              setShowUpgradeModal(true)
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 shrink-0"
          >
            Upgrade Plan
          </Button>
        </div>
      )}

      {/* Quotas & Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Monthly Inbound Leads</span>
              <span className="font-bold font-mono text-foreground">
                {quota.leadsUsed.toLocaleString()} / {quota.leadsMax.toLocaleString()}
              </span>
            </div>
            <Progress value={leadsPercent} className="h-2 [&>div]:bg-amber-500" />
            <p className="text-[11px] text-muted-foreground pt-1 flex justify-between">
              <span>{leadsPercent}% consumed</span>
              <span>Renews in 18 days</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">AI Cadence Touches</span>
              <span className="font-bold font-mono text-foreground">
                {quota.aiMessagesUsed.toLocaleString()} / {quota.aiMessagesMax.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.round((quota.aiMessagesUsed / quota.aiMessagesMax) * 100)} className="h-2 [&>div]:bg-indigo-600" />
            <p className="text-[11px] text-muted-foreground pt-1 flex justify-between">
              <span>42% consumed</span>
              <span>5,800 touches left</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Team Member Seats</span>
              <span className="font-bold font-mono text-foreground">
                {quota.seatsUsed} / {quota.seatsMax} Seats
              </span>
            </div>
            <Progress value={Math.round((quota.seatsUsed / quota.seatsMax) * 100)} className="h-2 [&>div]:bg-emerald-600" />
            <p className="text-[11px] text-muted-foreground pt-1 flex justify-between">
              <span>Growth Tier License</span>
              <span>6 seats available</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Available Subscription Tiers
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
            return (
              <Card
                key={plan.id}
                className={cn(
                  'flex flex-col justify-between transition-all duration-200 relative',
                  plan.current
                    ? 'border-indigo-600 dark:border-indigo-500 shadow-xl ring-2 ring-indigo-600/30'
                    : 'border-border/70 hover:shadow-md'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white font-bold text-[10px] px-3 py-0.5 tracking-wider uppercase">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                    {plan.current && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs mt-1.5 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </CardDescription>

                  <div className="pt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono tracking-tight text-foreground">
                      ₹{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">/ month</span>
                    {billingCycle === 'annual' && (
                      <span className="text-[10px] text-emerald-600 font-mono ml-1">billed annually</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 border-t border-border/50 pt-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Included Features:</div>
                  <ul className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/50">
                  {plan.current ? (
                    <Button variant="outline" className="w-full text-xs h-9 font-semibold border-indigo-500/40 text-indigo-600" disabled>
                      Active Subscription
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedPlanForUpgrade(plan.name)
                        setShowUpgradeModal(true)
                      }}
                      className={cn(
                        'w-full text-xs h-9 font-semibold text-white',
                        plan.id === 'agency' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-foreground text-background hover:opacity-90'
                      )}
                    >
                      Switch to {plan.name}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment Methods & Invoice History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Payment Methods */}
        <Card className="lg:col-span-5 border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              Payment Methods (India & Global)
            </CardTitle>
            <CardDescription className="text-xs">
              Supports UPI AutoPay, NetBanking, RuPay, Visa, Mastercard, and International Amex.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  UPI
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">UPI AutoPay (HDFC Bank)</div>
                  <div className="text-[11px] text-muted-foreground">growthscale@okhdfcbank</div>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px]">Primary</Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                  VISA
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Corporate Credit Card</div>
                  <div className="text-[11px] text-muted-foreground">•••• •••• •••• 4242 · Exp 08/28</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-7">Edit</Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="lg:col-span-7 border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Tax Invoices & GST Receipts
            </CardTitle>
            <CardDescription className="text-xs">
              GSTIN: 27AABCF1234F1Z9 · Invoices with 18% Input Tax Credit breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-foreground font-mono">{inv.id}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{inv.date} · via {inv.method}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono">{inv.amount}</div>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px] py-0">
                        {inv.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Download PDF">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Switch Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Confirm Plan Change</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You are switching to the <strong>{selectedPlanForUpgrade}</strong> tier. Your new quota will become active immediately and billing will be prorated.
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cycle</span>
                <span className="font-semibold capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-semibold">UPI AutoPay (HDFC)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prorated Today</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">₹0.00 (Processed next cycle)</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowUpgradeModal(false)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowUpgradeModal(false)}>
                Confirm & Activate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
