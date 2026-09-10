import { useState } from 'react'
import {
  CreditCard, Check, Sparkles, Zap, ShieldCheck, ArrowRight,
  TrendingUp, Users, MessageSquare, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/authStore'

export default function BillingPage() {
  const { organization } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Starter',
      priceMonthly: 49,
      priceAnnual: 39,
      description: 'Perfect for solo founders and boutique agencies getting started with automated follow-ups.',
      features: [
        'Up to 500 Leads / month',
        '1,500 AI Follow-up Messages',
        'Email & WhatsApp Webhook',
        'Standard AI Intent Scoring',
        '2 Team Member Seats',
        'Community Support',
      ],
      current: false,
    },
    {
      name: 'Professional',
      badge: 'Most Popular',
      priceMonthly: 129,
      priceAnnual: 99,
      description: 'For growing service businesses and agencies requiring full omnichannel automation.',
      features: [
        'Up to 2,500 Leads / month',
        '10,000 AI Follow-up Messages',
        'WhatsApp + Email + SMS + Instagram',
        'Real-time Intent Scoring & Insights',
        'Multi-step Cadence Workflows',
        '10 Team Member Seats',
        'Priority 24/7 Slack Support',
      ],
      current: true,
    },
    {
      name: 'Enterprise',
      priceMonthly: 299,
      priceAnnual: 249,
      description: 'Custom AI sales rep workflows, dedicated IP warm-up, and SLA guarantees.',
      features: [
        'Unlimited Inbound Leads',
        'Unlimited AI Autonomous Replies',
        'Dedicated IP & WhatsApp Official BSP',
        'Custom CRM & ERP Webhooks',
        'Unlimited Seats & Custom Roles',
        'Dedicated Account Manager',
        '99.9% Uptime SLA',
      ],
      current: false,
    },
  ]

  const invoices = [
    { id: 'INV-2025-001', date: 'Feb 01, 2025', amount: '$129.00', status: 'Paid' },
    { id: 'INV-2025-002', date: 'Jan 01, 2025', amount: '$129.00', status: 'Paid' },
    { id: 'INV-2024-012', date: 'Dec 01, 2024', amount: '$129.00', status: 'Paid' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-500" />
            Subscription & Billing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your workspace subscription tier, team quotas, and payment receipts.
          </p>
        </div>

        {/* Monthly / Annual billing toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg text-xs self-start">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              billingCycle === 'monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              billingCycle === 'annual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            Annual <Badge variant="success" className="text-[9px] px-1 py-0">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Quotas & Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Monthly Inbound Leads</span>
              <span className="font-semibold text-foreground">412 / 2,500</span>
            </div>
            <Progress value={16.5} className="h-2" />
            <p className="text-[11px] text-muted-foreground pt-1">
              Renews on March 1, 2025. 2,088 leads remaining.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">AI Messages Dispatched</span>
              <span className="font-semibold text-foreground">1,840 / 10,000</span>
            </div>
            <Progress value={18.4} className="h-2" />
            <p className="text-[11px] text-muted-foreground pt-1">
              Includes automated drips & dynamic AI suggestions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Team Member Seats</span>
              <span className="font-semibold text-foreground">4 / 10</span>
            </div>
            <Progress value={40} className="h-2" />
            <p className="text-[11px] text-muted-foreground pt-1">
              6 unused seats available for your sales reps.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
          return (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between relative transition-all ${
                plan.current
                  ? 'border-2 border-indigo-600 shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'hover:border-border/80'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {plan.badge}
                </div>
              )}

              <CardHeader className="pt-6">
                <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-foreground">${price}</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <CardDescription className="text-xs mt-2 min-h-[32px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-xs font-semibold text-foreground border-b pb-2">
                  What's included:
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4 border-t">
                {plan.current ? (
                  <Button variant="outline" disabled className="w-full text-xs font-semibold">
                    Current Active Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => alert(`Upgrade to ${plan.name} initiated`)}
                    className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    Upgrade to {plan.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Invoices History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing History & Receipts</CardTitle>
          <CardDescription className="text-xs">
            Download PDF receipts for your accounting records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-foreground">{inv.id}</div>
                  <div className="text-[11px] text-muted-foreground">{inv.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-foreground">{inv.amount}</span>
                  <Badge variant="success" className="text-[10px]">
                    {inv.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <Download className="w-3 h-3" /> PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
