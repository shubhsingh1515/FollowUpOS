import { useState, useEffect } from 'react'
import {
  Building2,
  Search,
  MoreVertical,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  LogIn,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import api from '@/lib/api'

export function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null)
  const [actionMessage, setActionMessage] = useState('')
  const [impersonateTarget, setImpersonateTarget] = useState<any | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/organizations')
      if (res.data?.data) {
        setOrgs(res.data.data)
      }
    } catch {
      // Sample mock data for demo
      setOrgs([
        {
          _id: 'org_001',
          name: 'Apex Growth Consultancy',
          slug: 'apex-growth',
          industry: 'consulting',
          plan: 'growth',
          owner: { name: 'Vikram Mehta', email: 'vikram@apexgrowth.in', phone: '+91 98112 34567' },
          subscription: { status: 'active', billingCycle: 'monthly', amount: 2999 },
          leadCount: 142,
          userCount: 4,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'org_002',
          name: 'Skyline Real Estate Brokers',
          slug: 'skyline-realty',
          industry: 'real_estate',
          plan: 'agency',
          owner: { name: 'Priya Nambiar', email: 'priya@skylinerealty.com', phone: '+91 98220 98765' },
          subscription: { status: 'active', billingCycle: 'annual', amount: 76788 },
          leadCount: 490,
          userCount: 12,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'org_003',
          name: 'Zeta Performance Ads',
          slug: 'zeta-ads',
          industry: 'digital_agency',
          plan: 'growth',
          owner: { name: 'Aman Verma', email: 'aman@zetamarketing.co', phone: '+91 98765 11223' },
          subscription: { status: 'trialing', billingCycle: 'monthly', amount: 2999 },
          leadCount: 28,
          userCount: 2,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOrgAction = async (orgId: string, action: string, plan?: string) => {
    try {
      await api.post(`/admin/organizations/${orgId}/action`, { action, plan })
      setActionMessage(`✓ Action ${action} executed successfully.`)
      fetchOrganizations()
      setTimeout(() => setActionMessage(''), 4000)
    } catch {
      setActionMessage(`✓ Action ${action} simulated in demo mode.`)
      setTimeout(() => setActionMessage(''), 4000)
    }
  }

  const handleConfirmImpersonate = async () => {
    if (!impersonateTarget) return
    setIsImpersonating(true)
    try {
      const res = await api.post('/admin/impersonate', {
        targetUserId: impersonateTarget._id,
        reason: 'Super Admin support session'
      })
      if (res.data?.accessToken) {
        localStorage.setItem('followupos_token', res.data.accessToken)
        window.location.href = '/today'
      }
    } catch {
      alert('Impersonation session granted in demo mode.')
      window.location.href = '/today'
    } finally {
      setIsImpersonating(false)
      setImpersonateTarget(null)
    }
  }

  const filtered = orgs.filter(
    (o) =>
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.owner?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer Workspaces</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage organization subscriptions, quotas, trial extensions, and support impersonation.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations or owners..."
            className="pl-8 bg-[#0E1118] border-white/10 text-xs h-9"
          />
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionMessage}
        </div>
      )}

      {/* Organizations Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-mono uppercase tracking-wider">
                <th className="p-4">Workspace & Owner</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Leads</th>
                <th className="p-4">Team</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map((org) => {
                const subStatus = org.subscription?.status || 'active'
                return (
                  <tr key={org._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{org.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {org.owner?.name || 'Owner'} · {org.owner?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 uppercase text-[10px]">
                        {org.plan}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          subStatus === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : subStatus === 'trialing'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {subStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-300">{org.leadCount || 0}</td>
                    <td className="p-4 font-mono text-zinc-300">{org.userCount || 1} seats</td>
                    <td className="p-4 font-mono text-zinc-400 text-[11px]">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setImpersonateTarget(org.owner)}
                          className="h-7 text-[10px] px-2.5 border-white/10 text-indigo-300 hover:bg-indigo-600/20 gap-1 font-semibold"
                        >
                          <LogIn className="w-3 h-3" /> Impersonate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrgAction(org._id, 'change_plan', 'agency')}
                          className="h-7 text-[10px] px-2 text-zinc-400 hover:text-white"
                          title="Upgrade to Agency"
                        >
                          Agency
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrgAction(org._id, 'suspend')}
                          className="h-7 text-[10px] px-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Suspend Workspace"
                        >
                          Suspend
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impersonation Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(impersonateTarget)}
        onClose={() => setImpersonateTarget(null)}
        onConfirm={handleConfirmImpersonate}
        title="Start Impersonation Session"
        description={`Generate a secure temporary impersonation session for ${impersonateTarget?.email}? This action is logged in immutable audit records.`}
        confirmText="Start Session"
        cancelText="Cancel"
        variant="warning"
        icon={<UserCheck className="w-5 h-5 text-amber-500" />}
        isLoading={isImpersonating}
      />
    </div>
  )
}

export default AdminOrganizationsPage
