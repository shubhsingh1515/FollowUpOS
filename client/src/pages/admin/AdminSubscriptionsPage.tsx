import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle2, AlertTriangle, ArrowUpRight, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 'sub_rzp_001',
      orgName: 'Apex Growth Consultancy',
      plan: 'Growth',
      billingCycle: 'Monthly',
      amount: '₹2,999',
      status: 'active',
      nextBilling: 'Oct 12, 2026',
      provider: 'Razorpay'
    },
    {
      id: 'sub_rzp_002',
      orgName: 'Skyline Real Estate Brokers',
      plan: 'Agency',
      billingCycle: 'Annual',
      amount: '₹76,788',
      status: 'active',
      nextBilling: 'Sep 10, 2027',
      provider: 'Razorpay'
    },
    {
      id: 'sub_rzp_003',
      orgName: 'Zeta Performance Ads',
      plan: 'Growth',
      billingCycle: 'Monthly',
      amount: '₹2,999',
      status: 'trialing',
      nextBilling: 'Sep 19, 2026',
      provider: 'Mock / Dev'
    }
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Subscription Lifecycle</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Monitor Razorpay auto-debits, billing cycles, renewals, and payment webhook sync.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-1">
          <span className="text-xs text-zinc-400">Total Active Subscriptions</span>
          <h3 className="text-2xl font-black font-mono text-white">38 Workspaces</h3>
          <span className="text-[11px] text-emerald-400 font-mono">100% In Good Standing</span>
        </div>
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-1">
          <span className="text-xs text-zinc-400">Failed / Retrying Payments</span>
          <h3 className="text-2xl font-black font-mono text-white">0 Failures</h3>
          <span className="text-[11px] text-zinc-500 font-mono">3-day grace period active</span>
        </div>
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-1">
          <span className="text-xs text-zinc-400">Average Revenue Per User (ARPU)</span>
          <h3 className="text-2xl font-black font-mono text-indigo-300">₹3,946 / mo</h3>
          <span className="text-[11px] text-indigo-400 font-mono">+12% vs last month</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-mono uppercase tracking-wider">
                <th className="p-4">Customer Workspace</th>
                <th className="p-4">Plan & Cycle</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Status</th>
                <th className="p-4">Next Renewal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {subscriptions.map((sub, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white text-sm">{sub.orgName}</td>
                  <td className="p-4 font-mono text-zinc-300">{sub.plan} ({sub.billingCycle})</td>
                  <td className="p-4 font-mono font-bold text-indigo-300">{sub.amount}</td>
                  <td className="p-4 font-mono text-zinc-400">{sub.provider}</td>
                  <td className="p-4">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono uppercase">
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono text-zinc-400">{sub.nextBilling}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminSubscriptionsPage
