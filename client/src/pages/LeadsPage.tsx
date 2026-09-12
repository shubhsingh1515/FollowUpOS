import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, Filter, Plus, Star, Flame, ChevronDown,
  MoreHorizontal, Eye, MessageSquare, Calendar, Archive,
  TrendingUp, Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  formatCurrency, getInitials, temperatureLabel,
  stageLabel, sourceIcon, timeAgo, cn,
} from '@/lib/utils'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import AddLeadModal from '@/components/AddLeadModal'

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const TEMPERATURES = ['hot', 'warm', 'cold']
const SOURCES = ['website', 'whatsapp', 'instagram', 'facebook', 'linkedin', 'email', 'manual', 'csv']

function LeadRow({ lead }: { lead: any }) {
  const { icon: tempIcon, className: tempClass, label: tempLabel } = temperatureLabel(lead.leadTemperature)
  const contact = lead.contactId

  return (
    <tr className="border-b border-border/50 hover:bg-accent/30 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className={cn('text-xs font-medium', lead.leadTemperature === 'hot' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700')}>
              {getInitials(contact?.fullName || '')}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link to={`/leads/${lead._id}`} className="text-sm font-medium hover:text-primary transition-colors">
              {contact?.fullName}
            </Link>
            <div className="text-xs text-muted-foreground">{contact?.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{contact?.company || '—'}</td>
      <td className="px-4 py-3">
        <span className="text-sm">{sourceIcon(lead.source)} <span className="text-xs capitalize text-muted-foreground">{lead.source?.replace('_', ' ')}</span></span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="relative w-12 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('absolute inset-y-0 left-0 rounded-full', lead.leadScore >= 70 ? 'bg-red-500' : lead.leadScore >= 45 ? 'bg-orange-500' : 'bg-blue-500')}
              style={{ width: `${lead.leadScore}%` }}
            />
          </div>
          <span className="text-sm font-medium">{lead.leadScore}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', tempClass)}>
          {tempIcon} {tempLabel}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium border',
          lead.status === 'won' ? 'bg-green-100 text-green-700 border-green-200' :
          lead.status === 'lost' ? 'bg-red-100 text-red-700 border-red-200' :
          'bg-secondary text-secondary-foreground border-transparent'
        )}>
          {stageLabel(lead.status)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {lead.estimatedValue ? formatCurrency(lead.estimatedValue, lead.currency) : '—'}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {lead.lastContactAt ? timeAgo(lead.lastContactAt) : 'Never'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/leads/${lead._id}`}>
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link to="/inbox">
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <MessageSquare className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  )
}

export default function LeadsPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [temperature, setTemperature] = useState('')
  const [source, setSource] = useState('')
  const [page, setPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { organization } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsAddModalOpen(true)
    }
  }, [searchParams])

  const { data, isLoading } = useQuery<any>({
    queryKey: ['leads', { search, status, temperature, source, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      if (temperature) params.append('temperature', temperature)
      if (source) params.append('source', source)
      const { data } = await api.get(`/leads?${params}`)
      return data.data
    },
    placeholderData: keepPreviousData,
  })

  return (
    <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newLead) => {
          if (newLead?._id) navigate(`/leads/${newLead._id}`)
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.total ? `${data.total} leads` : 'All your leads'}
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, company..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Stages</option>
            {STAGES.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}
          </select>
          <select
            value={temperature}
            onChange={(e) => { setTemperature(e.target.value); setPage(1) }}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Temperatures</option>
            {TEMPERATURES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1) }}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Sources</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">AI Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Temperature</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Last Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3" colSpan={9}>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                    </tr>
                  ))
                : !data?.leads?.length
                ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="text-3xl mb-2">📋</div>
                        <p className="font-medium text-sm">No leads yet.</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                          Connect a channel or import your first leads to get started.
                        </p>
                        <Button size="sm" onClick={() => navigate('/leads/new')}>
                          <Plus className="w-4 h-4 mr-1.5" />
                          Add your first lead
                        </Button>
                      </td>
                    </tr>
                  )
                : data.leads.map((lead: any) => <LeadRow key={lead._id} lead={lead} />)
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
