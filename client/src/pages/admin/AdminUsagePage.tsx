import { useState } from 'react'
import { BarChart3, Sparkles, Cpu, Zap, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AdminUsagePage() {
  const usageStats = [
    {
      orgName: 'Apex Growth Consultancy',
      leadsUsed: 142,
      leadsLimit: 1000,
      aiAnalyses: 218,
      aiMessages: 460,
      estCostINR: '₹284'
    },
    {
      orgName: 'Skyline Real Estate Brokers',
      leadsUsed: 490,
      leadsLimit: 5000,
      aiAnalyses: 820,
      aiMessages: 1940,
      estCostINR: '₹1,120'
    },
    {
      orgName: 'Zeta Performance Ads',
      leadsUsed: 28,
      leadsLimit: 1000,
      aiAnalyses: 42,
      aiMessages: 80,
      estCostINR: '₹48'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">AI Compute & Usage Metrics</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Monitor token consumption, GPT-4o execution costs, and customer plan quota utilization.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total AI Tokens Processed</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black font-mono text-white">4.82M Tokens</h3>
          <span className="text-[11px] text-zinc-500 font-mono">Input: 3.1M | Output: 1.72M</span>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Est. OpenAI Monthly Bill</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black font-mono text-purple-300">₹1,850 (~$22)</h3>
          <span className="text-[11px] text-emerald-400 font-mono">1.2% of Total MRR (High Margin)</span>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Over-Quota Alerts</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-black font-mono text-white">0 Accounts</h3>
          <span className="text-[11px] text-zinc-500 font-mono">Soft warnings at 80%</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118] overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Organization Usage Meter</h3>
          <span className="text-xs font-mono text-zinc-500">Current Billing Cycle</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-mono uppercase tracking-wider">
                <th className="p-4">Workspace</th>
                <th className="p-4">Leads Utilization</th>
                <th className="p-4">AI Ingestion Scored</th>
                <th className="p-4">AI Replies Generated</th>
                <th className="p-4 text-right">Estimated AI Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {usageStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white text-sm">{item.orgName}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-300">{item.leadsUsed} / {item.leadsLimit}</span>
                        <span className="text-zinc-500">{Math.round((item.leadsUsed / item.leadsLimit) * 100)}%</span>
                      </div>
                      <div className="w-32 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${(item.leadsUsed / item.leadsLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-zinc-300">{item.aiAnalyses}</td>
                  <td className="p-4 font-mono text-zinc-300">{item.aiMessages}</td>
                  <td className="p-4 font-mono font-bold text-indigo-300 text-right">{item.estCostINR}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsagePage
