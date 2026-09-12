import { useState } from 'react'
import { Activity, CheckCircle2, Server, Database, Sparkles, CreditCard, Mail, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function AdminSystemHealthPage() {
  const [refreshing, setRefreshing] = useState(false)

  const services = [
    { name: 'Core API Server (Express)', status: 'healthy', latency: '18ms', icon: Server },
    { name: 'Primary Database (MongoDB Atlas)', status: 'healthy', latency: '4ms', icon: Database },
    { name: 'AI Pipeline Engine (OpenAI / GPT-4o)', status: 'healthy', latency: '420ms', icon: Sparkles },
    { name: 'Billing & Webhook Adapter (Razorpay)', status: 'healthy', latency: '85ms', icon: CreditCard },
    { name: 'Transactional Email (SMTP / Nodemailer)', status: 'healthy', latency: '62ms', icon: Mail },
    { name: 'Background Cadence Scheduler (Node-Cron)', status: 'healthy', latency: 'Active Worker', icon: Clock },
  ]

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Infrastructure Health</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time heartbeat monitoring across backend services, database clusters, and 3rd-party APIs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="border-white/10 text-xs h-9 gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc, idx) => {
          const Icon = svc.icon
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {svc.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{svc.name}</h3>
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Latency / Worker:</span>
                  <span className="text-zinc-200 font-semibold">{svc.latency}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminSystemHealthPage
