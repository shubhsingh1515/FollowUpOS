import { useState } from 'react'
import { ShieldAlert, User, Clock, Terminal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AdminAuditLogsPage() {
  const [logs] = useState([
    {
      id: 'log_001',
      admin: 'admin@followupos.com',
      action: 'IMPERSONATION_START',
      target: 'Apex Growth Consultancy (vikram@apexgrowth.in)',
      timestamp: '10 mins ago',
      ip: '103.21.144.12'
    },
    {
      id: 'log_002',
      admin: 'admin@followupos.com',
      action: 'PLAN_CHANGE_MANUAL',
      target: 'Skyline Real Estate (Upgraded to Agency)',
      timestamp: '1 hour ago',
      ip: '103.21.144.12'
    },
    {
      id: 'log_003',
      admin: 'admin@followupos.com',
      action: 'SUPPORT_TICKET_REPLY',
      target: 'Ticket #tick_002 (Resolved)',
      timestamp: '3 hours ago',
      ip: '103.21.144.12'
    },
    {
      id: 'log_004',
      admin: 'admin@followupos.com',
      action: 'ADMIN_LOGIN',
      target: 'Platform Command Center Session',
      timestamp: '5 hours ago',
      ip: '103.21.144.12'
    }
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Security Audit Logs</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Immutable cryptographic log of all administrative actions, impersonation sessions, and plan overrides.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 uppercase tracking-wider text-[11px]">
                <th className="p-4">Action Type</th>
                <th className="p-4">Admin Operator</th>
                <th className="p-4">Target Entity / Detail</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-4 text-white font-semibold">{log.admin}</td>
                  <td className="p-4 text-zinc-300">{log.target}</td>
                  <td className="p-4 text-zinc-500">{log.ip}</td>
                  <td className="p-4 text-zinc-400 text-right">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminAuditLogsPage
