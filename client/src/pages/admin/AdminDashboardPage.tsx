import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Building2,
  Users,
  CreditCard,
  Target,
  Sparkles,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

const PLAN_COLORS: Record<string, string> = {
  growth: 'bg-indigo-500',
  agency: 'bg-purple-500',
  starter: 'bg-zinc-400',
}

function MetricCard({
  title, value, sub, icon: Icon, color, badge, loading,
}: {
  title: string
  value: string | number
  sub: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  badge?: string
  loading?: boolean
}) {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{title}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="space-y-1">
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 bg-white/5" />
            <Skeleton className="h-3 w-32 bg-white/5" />
          </>
        ) : (
          <>
            <h3 className="text-2xl font-black font-mono text-white tracking-tight">{value}</h3>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 font-mono">{sub}</span>
              {badge && <span className="text-emerald-400 font-mono font-semibold">{badge}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [planDist, setPlanDist] = useState<any[]>([])
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [metricsRes, planRes, healthRes] = await Promise.allSettled([
          api.get('/admin/metrics'),
          api.get('/admin/plan-distribution'),
          api.get('/admin/system-health'),
        ])

        if (metricsRes.status === 'fulfilled' && metricsRes.value.data?.data) {
          setMetrics(metricsRes.value.data.data)
        }
        if (planRes.status === 'fulfilled' && planRes.value.data?.data) {
          setPlanDist(planRes.value.data.data)
        }
        if (healthRes.status === 'fulfilled' && healthRes.value.data?.data) {
          setHealth(healthRes.value.data.data)
        }
      } catch {
        // Individual errors handled by allSettled above
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const statCards = [
    {
      title: 'Monthly Recurring Revenue (MRR)',
      value: metrics ? `₹${(metrics.mrr || 0).toLocaleString()}` : '—',
      sub: metrics ? `ARR: ₹${(metrics.arrEstimate || 0).toLocaleString()}` : 'Loading...',
      icon: TrendingUp,
      color: 'text-indigo-400',
    },
    {
      title: 'Active Paying Workspaces',
      value: metrics?.activeSubscriptions ?? '—',
      sub: metrics ? `${metrics.trials || 0} active trials` : 'Loading...',
      icon: Building2,
      color: 'text-emerald-400',
    },
    {
      title: 'Total Leads Ingested',
      value: metrics ? metrics.totalLeads.toLocaleString() : '—',
      sub: 'Across all channels',
      icon: Target,
      color: 'text-blue-400',
    },
    {
      title: 'AI Analyses This Month',
      value: metrics ? (metrics.aiUsageThisMonth || 0).toLocaleString() : '—',
      sub: metrics ? `Est. AI Cost: ₹${(metrics.estimatedAICostINR || 0).toLocaleString()}` : 'Loading...',
      icon: Sparkles,
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Platform Command Center</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Real-time metrics from MongoDB — subscriptions, usage, and system status.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <MetricCard key={idx} {...card} loading={loading} />
        ))}
      </div>

      {/* Plan Distribution & Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution — from real DB */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" /> Active Plan Tier Breakdown
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">Live from MongoDB</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-1.5 w-full bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : planDist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-xs gap-2">
              <AlertTriangle className="w-6 h-6" />
              <span>No active subscriptions yet.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {planDist.map((item, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white capitalize">{item.plan} Plan</span>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-zinc-400">{item.count} org{item.count !== 1 ? 's' : ''}</span>
                      <span className="font-bold text-indigo-300">₹{(item.totalMRR || 0).toLocaleString()}/mo</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${PLAN_COLORS[item.plan] || 'bg-zinc-400'}`}
                      style={{ width: `${item.percentage || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health — from real DB */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-emerald-400" /> System Status
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Database', key: 'database' },
              { label: 'AI Provider', key: 'aiProvider' },
              { label: 'Billing', key: 'billing' },
              { label: 'Email', key: 'email' },
              { label: 'Webhooks', key: 'webhooks' },
            ].map(({ label, key }) => {
              const svc = health?.[key]
              const status = svc?.status || (loading ? 'loading' : 'unknown')
              const isOk = status === 'healthy' || status === 'configured'
              return (
                <div key={key} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <span className="text-zinc-400">{label}:</span>
                  {loading ? (
                    <Skeleton className="h-4 w-16 bg-white/5" />
                  ) : (
                    <span className={`font-mono flex items-center gap-1 ${isOk ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              )
            })}

            {/* Open tickets */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">Open Support Tickets:</span>
              {loading ? (
                <Skeleton className="h-4 w-10 bg-white/5" />
              ) : (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-mono">
                  {metrics?.openTickets ?? 0} Pending
                </Badge>
              )}
            </div>

            {/* Webhooks today */}
            {health?.webhooks && !loading && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                <span className="text-zinc-400">Webhooks Today:</span>
                <span className="text-zinc-300 font-mono text-[11px]">
                  {health.webhooks.processedToday || 0} processed
                  {health.webhooks.failedToday > 0 && (
                    <span className="text-red-400 ml-1">({health.webhooks.failedToday} failed)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
