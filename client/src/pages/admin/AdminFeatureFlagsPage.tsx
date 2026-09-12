import { useState } from 'react'
import { Flag, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState([
    {
      key: 'AI_COPILOT',
      name: 'AI Sales Copilot Chat & Deal Suggestions',
      description: 'Allows sales reps to query live deals, draft objection responses, and ask for next best actions.',
      status: true,
      plans: ['growth', 'agency']
    },
    {
      key: 'SMART_FOLLOWUPS',
      name: 'Deterministic Cadence & Auto-Pause Engine',
      description: 'Auto-schedules sequence steps and halts immediately when prospect responds.',
      status: true,
      plans: ['starter', 'growth', 'agency']
    },
    {
      key: 'WHATSAPP_INTEGRATION',
      name: 'Official Meta WhatsApp Business Cloud API',
      description: 'Inbound message webhook parsing and approved template outbound triggers.',
      status: true,
      plans: ['growth', 'agency']
    },
    {
      key: 'META_LEAD_ADS',
      name: 'Meta / Instagram Lead Ads Ingestion',
      description: 'Direct webhook subscription to Facebook Page lead forms.',
      status: true,
      plans: ['growth', 'agency']
    },
    {
      key: 'WHITE_LABEL',
      name: 'Custom Domain & Agency White-Labeling',
      description: 'Allows agency customers to brand the dashboard with their own logo and custom CNAME.',
      status: false,
      plans: ['agency']
    }
  ])

  const toggleFlag = (key: string) => {
    setFlags(flags.map((f) => (f.key === key ? { ...f, status: !f.status } : f)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Platform Feature Flags</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Dynamically enable or disable platform capabilities across tiers without redeploying code.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118] divide-y divide-white/[0.06]">
        {flags.map((flag) => (
          <div key={flag.key} className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-white text-sm">{flag.name}</span>
                <code className="text-[10px] font-mono bg-black/40 text-indigo-300 px-2 py-0.5 rounded border border-white/[0.08]">
                  {flag.key}
                </code>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{flag.description}</p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-500 font-mono">Tiers:</span>
                {flag.plans.map((p) => (
                  <Badge key={p} variant="outline" className="text-[9px] font-mono uppercase bg-white/[0.02]">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            <button
              onClick={() => toggleFlag(flag.key)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                flag.status ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  flag.status ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminFeatureFlagsPage
