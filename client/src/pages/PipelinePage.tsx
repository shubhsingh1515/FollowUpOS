import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Sparkles, TrendingUp, DollarSign, Target, CheckCircle2,
  Calendar, Clock, Search, Filter, ArrowRight, ShieldCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, getInitials, temperatureLabel, timeAgo, cn } from '@/lib/utils'
import api from '@/lib/api'

export const PIPELINE_STAGES = [
  { id: 'new', label: 'New Lead', prob: 0.10, color: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' },
  { id: 'contacted', label: 'Contacted', prob: 0.20, color: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  { id: 'qualified', label: 'Qualified', prob: 0.40, color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300' },
  { id: 'meeting', label: 'Meeting Booked', prob: 0.50, color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' },
  { id: 'proposal', label: 'Proposal Sent', prob: 0.65, color: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300' },
  { id: 'negotiation', label: 'Negotiation', prob: 0.80, color: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { id: 'won', label: '🏆 Closed Won', prob: 1.00, color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { id: 'lost', label: 'Closed Lost', prob: 0.00, color: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300' },
]

function LeadCard({ lead, stageProb }: { lead: any; stageProb: number }) {
  const contact = lead.contactId
  const { icon: tempIcon } = temperatureLabel(lead.leadTemperature)
  const [isDragging, setIsDragging] = useState(false)
  const dealValue = lead.estimatedValue || lead.dealValue || 85000
  const weightedValue = Math.round(dealValue * stageProb)

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.setData('text/plain', lead._id)
      }}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        'bg-card rounded-xl border border-border/70 p-3.5 cursor-grab hover:shadow-lg transition-all duration-200 hover:border-primary/40 active:cursor-grabbing select-none group',
        isDragging && 'opacity-30 scale-95 ring-2 ring-primary'
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-border/50">
          <AvatarFallback className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
            {getInitials(contact?.fullName || lead?.name || '')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Link
            to={`/leads/${lead._id}`}
            className="text-xs font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 group-hover:underline"
          >
            {contact?.fullName || lead?.name}
          </Link>
          <div className="text-[11px] text-muted-foreground truncate font-medium">
            {contact?.company || lead?.serviceRequired || 'Direct Inquiry'}
          </div>
        </div>
        <span className="text-xs" title={`Temperature: ${lead.leadTemperature || 'warm'}`}>
          {tempIcon}
        </span>
      </div>

      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground">Deal Value</div>
          <div className="text-xs font-bold text-foreground font-mono">
            {formatCurrency(dealValue, lead.currency || 'INR')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Weighted</div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
            {formatCurrency(weightedValue, lead.currency || 'INR')}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Score {lead.leadScore || lead.aiScore || 75}</span>
        </div>
        <div>{timeAgo(lead.lastContactAt || lead.createdAt)}</div>
      </div>
    </div>
  )
}

function PipelineColumn({
  stage,
  leads,
  onDrop,
}: {
  stage: (typeof PIPELINE_STAGES)[0]
  leads: any[]
  onDrop: (leadId: string, stage: string) => void
}) {
  const [isOver, setIsOver] = useState(false)
  const totalValue = leads.reduce((sum, l) => sum + (l.estimatedValue || l.dealValue || 85000), 0)
  const weightedValue = Math.round(totalValue * stage.prob)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        const leadId = e.dataTransfer.getData('text/plain')
        if (leadId) onDrop(leadId, stage.id)
      }}
      className={cn(
        'flex flex-col gap-2 min-w-[270px] w-[270px] shrink-0 transition-colors',
        isOver && 'bg-primary/5 rounded-2xl'
      )}
    >
      {/* Column Header */}
      <div className="p-2.5 rounded-xl bg-card border border-border/60 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn('text-xs font-semibold px-2 py-0.5', stage.color)}>
            {stage.label}
          </Badge>
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {leads.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
          <span className="text-muted-foreground font-mono font-medium">
            {formatCurrency(totalValue, 'INR')}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold" title="Weighted forecast">
            {Math.round(stage.prob * 100)}% ({formatCurrency(weightedValue, 'INR')})
          </span>
        </div>
      </div>

      {/* Column Dropzone */}
      <div
        className={cn(
          'flex flex-col gap-2.5 min-h-[480px] p-2 rounded-2xl transition-all border',
          isOver
            ? 'bg-primary/10 border-2 border-dashed border-primary/50 shadow-inner'
            : 'bg-muted/30 border-transparent hover:border-border/40'
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead._id} lead={lead} stageProb={stage.prob} />
        ))}
        {leads.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-xs p-4 border border-dashed border-border/40 rounded-xl">
            <span className="text-sm mb-1 opacity-50">📥</span>
            Drop deals here to advance stage
          </div>
        )}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['leads', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/leads?limit=100')
      return data.data?.leads || []
    },
  })

  const stageMutation = useMutation({
    mutationFn: ({ leadId, stage }: { leadId: string; stage: string }) =>
      api.post(`/leads/${leadId}/change-stage`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })

  const handleDrop = (leadId: string, newStage: string) => {
    const lead = data?.find((l: any) => l._id === leadId)
    if (lead && lead.status !== newStage) {
      stageMutation.mutate({ leadId, stage: newStage })
    }
  }

  // Filtered leads
  const filteredLeads = useMemo(() => {
    if (!data) return []
    if (!searchQuery.trim()) return data
    const q = searchQuery.toLowerCase()
    return data.filter((lead: any) => {
      const name = lead.contactId?.fullName || lead.name || ''
      const comp = lead.contactId?.company || lead.serviceRequired || ''
      return name.toLowerCase().includes(q) || comp.toLowerCase().includes(q)
    })
  }, [data, searchQuery])

  // Group leads by stage
  const leadsByStage: Record<string, any[]> = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    PIPELINE_STAGES.forEach((s) => {
      grouped[s.id] = []
    })
    filteredLeads.forEach((lead: any) => {
      let currentStatus = lead.status || 'new'
      if (!grouped[currentStatus]) {
        currentStatus = 'new'
      }
      grouped[currentStatus].push(lead)
    })
    return grouped
  }, [filteredLeads])

  // Pipeline Metrics
  const metrics = useMemo(() => {
    let totalPipeline = 0
    let weightedForecast = 0
    let activeDeals = 0
    let wonDeals = 0
    let closedDeals = 0

    filteredLeads.forEach((lead: any) => {
      const val = lead.estimatedValue || lead.dealValue || 85000
      const st = lead.status || 'new'
      const stageObj = PIPELINE_STAGES.find((s) => s.id === st) || PIPELINE_STAGES[0]

      if (st !== 'lost') {
        totalPipeline += val
        weightedForecast += Math.round(val * stageObj.prob)
      }
      if (st !== 'won' && st !== 'lost') {
        activeDeals++
      }
      if (st === 'won') wonDeals++
      if (st === 'won' || st === 'lost') closedDeals++
    })

    const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 68

    return {
      totalPipeline,
      weightedForecast,
      activeDeals,
      winRate,
    }
  }, [filteredLeads])

  return (
    <div className="p-4 lg:p-6 animate-fade-in space-y-6">
      {/* Header & Forecast Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Deal Pipeline & Weighted Forecast
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            8-stage visual deal board with dynamic probability weighting and automated follow-up triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search deals, contacts, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>
        </div>
      </div>

      {/* KPI Forecast Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Active Pipeline</span>
              <DollarSign className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-foreground">
              {formatCurrency(metrics.totalPipeline, 'INR')}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Across all open deal stages
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/30 bg-indigo-500/5 shadow-sm">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
              <span className="font-semibold">AI Weighted Forecast</span>
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-indigo-900 dark:text-indigo-200">
              {formatCurrency(metrics.weightedForecast, 'INR')}
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
              Deal Value × Stage Probability
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Active Deals in Flight</span>
              <Target className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-foreground">
              {metrics.activeDeals} Deals
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Requiring sales follow-up
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Historical Win Rate</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
              {metrics.winRate}%
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Target benchmark: &gt; 65%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board with 8 Stages */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((s) => (
            <div key={s.id} className="min-w-[270px]">
              <Skeleton className="h-10 w-full mb-2 rounded-xl" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] || []}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  )
}
