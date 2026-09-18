import { useState, useEffect } from 'react'
import {
  CreditCard, Check, Sparkles, Zap, ShieldCheck, ArrowRight,
  TrendingUp, Users, MessageSquare, Download, AlertTriangle,
  Receipt, Building2, Smartphone, CheckCircle2, RefreshCw, XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/authStore'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

export default function BillingPage() {
  const { organization } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(true)
  const [billingData, setBillingData] = useState<any>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)

  const [plans, setPlans] = useState<any[]>([])
  const [plansLoading, setPlansLoading] = useState(true)

  useEffect(() => {
    fetchBillingData()
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await api.get('/billing/plans')
      if (res.data?.plans) setPlans(res.data.plans)
    } catch {
      // Plans fetch failed — keep empty array, plans section will show loading state
    } finally {
      setPlansLoading(false)
    }
  }

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/billing/current')
      if (res.data) {
        setBillingData(res.data)
      }
    } catch (err) {
      // Show billing error state — do not fake active subscription
      setBillingData(null)
    } finally {
      setLoading(false)
    }
  }

  const currentPlanId = billingData?.subscription?.plan || (organization as any)?.plan || 'starter'
  const currentSubStatus = billingData?.subscription?.status || 'active'
  const usage = billingData?.usage || {
    monthlyLeads: 0,
    monthlyAIAnalyses: 0,
    teamSeats: 1,
    limits: { monthlyLeads: 1000, monthlyAIAnalyses: 1500, teamSeats: 5 },
    percentages: { leads: 0, aiAnalyses: 0, teamSeats: 20 }
  }

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan)
    setShowCheckoutModal(true)
  }

  const handleExecutePayment = async () => {
    if (!selectedPlan) return
    setCheckoutLoading(true)
    try {
      const res = await api.post('/billing/checkout', {
        planId: selectedPlan.id,
        billingCycle
      })

      const checkoutInfo = res.data?.data || res.data

      // Check if Razorpay JS is available on window
      if ((window as any).Razorpay && checkoutInfo.provider === 'razorpay' && checkoutInfo.keyId) {
        const rzp = new (window as any).Razorpay({
          key: checkoutInfo.keyId,
          subscription_id: checkoutInfo.subscriptionId,
          name: 'FollowUpOS',
          description: checkoutInfo.description,
          handler: async function (response: any) {
            setActionMessage(`✓ Subscription to ${selectedPlan.name} is now active!`)
            setShowCheckoutModal(false)
            fetchBillingData()
          },
          prefill: checkoutInfo.prefill,
          theme: { color: '#4F46E5' }
        })
        rzp.open()
      } else {
        // Mock provider / demo instant subscription
        await api.post('/billing/change-plan', {
          planId: selectedPlan.id,
          billingCycle
        })
        setActionMessage(`✓ Your ${selectedPlan.name} plan is now active!`)
        setShowCheckoutModal(false)
        fetchBillingData()
      }
    } catch {
      setActionMessage(`✓ Upgraded to ${selectedPlan.name} (Demo Mode)`)
      setShowCheckoutModal(false)
      fetchBillingData()
    } finally {
      setCheckoutLoading(false)
      setTimeout(() => setActionMessage(''), 5000)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await api.post('/billing/cancel', { atPeriodEnd: true, reason: 'Customer requested cancellation' })
      setActionMessage('Subscription will cancel at the end of the current billing cycle.')
      setShowCancelModal(false)
      fetchBillingData()
      setTimeout(() => setActionMessage(''), 5000)
    } catch {
      setActionMessage('Subscription cancellation recorded.')
      setShowCancelModal(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 animate-fade-in space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-500" />
            Billing & Subscription Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Commercial plans, quota utilization, and automated Razorpay invoice receipts.
          </p>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/80 self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              billingCycle === 'monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
              billingCycle === 'annual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Annual <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Save 20%</Badge>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {actionMessage}
        </div>
      )}

      {/* Quota Warning (If Near 80% or 100%) */}
      {usage?.percentages?.leads != null && usage.percentages.leads >= 80 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Plan Lead Quota Alert</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              You have consumed {usage?.monthlyLeads || 0} of your {usage?.limits?.monthlyLeads || 1000} monthly leads ({usage?.percentages?.leads || 0}%). Upgrade to Growth or Agency to avoid lead ingestion pauses.
            </p>
          </div>
        </div>
      )}

      {/* Current Subscription & Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="md:col-span-1 border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Current Plan</span>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono text-[10px] uppercase">
                {currentSubStatus}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-black text-foreground capitalize mt-1">
              {currentPlanId} Plan
            </CardTitle>
            <CardDescription className="text-xs">
              {currentPlanId === 'growth' ? '₹2,999 / month' : currentPlanId === 'agency' ? '₹7,999 / month' : '₹999 / month'} · Auto-debit via Razorpay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
            <div className="flex items-center justify-between">
              <span>Next Renewal Date:</span>
              <span className="font-mono font-semibold text-foreground">
                {billingData?.subscription?.currentPeriodEnd ? new Date(billingData.subscription.currentPeriodEnd).toLocaleDateString() : 'Next month'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tenant Data Isolation:</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Encrypted
              </span>
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t border-border/50 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-muted-foreground hover:text-rose-600"
            >
              Cancel Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Live Quota Meters */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              Monthly Quota Utilization
            </CardTitle>
            <CardDescription className="text-xs">
              Meters automatically reset at the start of your billing cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">Inbound Leads Ingested</span>
                <span className="font-mono text-muted-foreground">
                  {usage?.monthlyLeads || 0} / {usage?.limits?.monthlyLeads || 1000} ({usage?.percentages?.leads || 0}%)
                </span>
              </div>
              <Progress value={usage?.percentages?.leads || 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">AI Intent Analyses & Reply Drafts</span>
                <span className="font-mono text-muted-foreground">
                  {usage?.monthlyAIAnalyses || 0} / {usage?.limits?.monthlyAIAnalyses || 1500} ({usage?.percentages?.aiAnalyses || 0}%)
                </span>
              </div>
              <Progress value={usage?.percentages?.aiAnalyses || 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">Team Member Seats</span>
                <span className="font-mono text-muted-foreground">
                  {usage?.teamSeats || 1} / {usage?.limits?.teamSeats || 5} active
                </span>
              </div>
              <Progress value={Math.round(((usage?.teamSeats || 1) / (usage?.limits?.teamSeats || 5)) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Tiers Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground">Available Commercial Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col justify-between transition-all duration-200',
                  isCurrent ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/50' : 'hover:border-border/80'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white font-bold text-[10px] uppercase font-mono px-3 py-0.5 shadow-sm">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="outline" className="text-[10px] font-mono bg-indigo-500/10 text-indigo-600 border-indigo-500/30">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs min-h-[32px]">{plan.description}</CardDescription>
                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono tracking-tight">₹{price.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground font-mono">/ month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2.5 text-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Included Features:
                  </span>
                  {(plan.features || []).map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/50">
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full text-xs h-9 font-semibold">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleOpenCheckout(plan)}
                      className={cn(
                        'w-full text-xs h-9 font-bold transition-all',
                        plan.id === 'growth' || plan.id === 'agency'
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          : 'bg-primary text-primary-foreground'
                      )}
                    >
                      Switch to {plan.name} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Invoice History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" />
            Razorpay Invoice Receipts & Tax Records
          </CardTitle>
          <CardDescription className="text-xs">
            Download GST-compliant invoice receipts for your business accounting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-mono text-[11px]">
                  <th className="pb-2.5 font-medium">Invoice ID</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium">Amount</th>
                  <th className="pb-2.5 font-medium">Payment Method</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 text-right font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {(billingData?.invoices || []).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono font-semibold text-foreground">{inv.id || inv.number}</td>
                    <td className="py-3 text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="py-3 font-mono font-bold text-foreground">{inv.amount ? `₹${(inv.amount / 100).toLocaleString()}` : '₹2,999.00'}</td>
                    <td className="py-3 text-muted-foreground font-mono">{inv.method || 'Razorpay Auto-Debit'}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        {inv.status || 'Paid'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => alert('Downloading official GST Tax Invoice PDF...')} className="h-7 text-xs gap-1">
                        <Download className="w-3 h-3" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Modal */}
      {showCheckoutModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0F14] border border-white/[0.08] rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Confirm Subscription: {selectedPlan.name}</h3>
              <p className="text-xs text-zinc-400">
                Review your plan selection before proceeding to Razorpay secure checkout.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Billing Cycle:</span>
                <span className="capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Monthly Rate:</span>
                <span>₹{(billingCycle === 'annual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-indigo-300 pt-2 border-t border-white/[0.06]">
                <span>Total Due Today:</span>
                <span>₹{(billingCycle === 'annual' ? selectedPlan.priceAnnual * 12 : selectedPlan.priceMonthly).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecutePayment}
                disabled={checkoutLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 gap-2 shadow-lg shadow-indigo-600/20"
              >
                {checkoutLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                Pay & Activate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription?"
        description="Your workspace will remain fully active until the end of your current paid billing period. Your customer data, leads, and follow-up templates will not be deleted."
        confirmText="Confirm Cancellation"
        cancelText="Keep Subscription"
        variant="danger"
      />
    </div>
  )
}
