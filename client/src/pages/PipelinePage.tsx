import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, getInitials, temperatureLabel, timeAgo, cn } from '@/lib/utils'
import api from '@/lib/api'

const STAGES = [
  { id: 'new', label: 'New', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-200' },
  { id: 'won', label: '🏆 Won', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-200' },
  { id: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-200' },
]

function LeadCard({ lead }: { lead: any }) {
  const contact = lead.contactId
  const { icon: tempIcon } = temperatureLabel(lead.leadTemperature)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.setData('text/plain', lead._id)
      }}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        'bg-card rounded-xl border border-border/60 p-3 cursor-grab hover:shadow-md transition-all hover:border-primary/30 active:cursor-grabbing select-none',
        isDragging && 'opacity-40 scale-95'
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
          <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
            {getInitials(contact?.fullName || lead?.name || '')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Link to={`/leads/${lead._id}`} className="text-sm font-medium hover:text-primary line-clamp-1">
            {contact?.fullName || lead?.name}
          </Link>
          <div className="text-xs text-muted-foreground truncate">{contact?.company || lead?.serviceRequired}</div>
        </div>
        <span className="text-sm">{tempIcon}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Score: {lead.leadScore || lead.aiScore || 50}
        </span>
        {(lead.estimatedValue > 0 || lead.dealValue > 0) && (
          <span className="text-xs font-semibold text-foreground">
            {formatCurrency(lead.estimatedValue || lead.dealValue || 0, lead.currency || 'USD')}
          </span>
        )}
      </div>
      {(lead.lastContactAt || lead.createdAt) && (
        <div className="text-[10px] text-muted-foreground mt-1">
          {timeAgo(lead.lastContactAt || lead.createdAt)}
        </div>
      )}
    </div>
  )
}

function PipelineColumn({
  stage,
  leads,
  onDrop,
}: {
  stage: (typeof STAGES)[0]
  leads: any[]
  onDrop: (leadId: string, stage: string) => void
}) {
  const [isOver, setIsOver] = useState(false)
  const totalValue = leads.reduce((sum, l) => sum + (l.estimatedValue || l.dealValue || 0), 0)

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
        'flex flex-col gap-2 min-w-[240px] w-[240px] shrink-0 transition-colors',
        isOver && 'bg-primary/5 rounded-xl'
      )}
    >
      <div className="px-1 mb-1">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border',
            stage.color
          )}
        >
          {stage.label}
          <span className="font-bold">{leads.length}</span>
        </div>
        {totalValue > 0 && (
          <div className="text-xs text-muted-foreground mt-0.5 px-1">
            {formatCurrency(totalValue, 'USD')}
          </div>
        )}
      </div>
      <div
        className={cn(
          'flex flex-col gap-2 min-h-[300px] p-2 rounded-xl transition-colors',
          isOver ? 'bg-primary/10 border-2 border-dashed border-primary/40' : 'bg-muted/30 border border-transparent'
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead._id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div className="text-center py-12 text-xs text-muted-foreground">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leads', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/leads?limit=100')
      return data.data.leads || []
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

  // Group leads by stage
  const leadsByStage: Record<string, any[]> = {}
  STAGES.forEach((s) => {
    leadsByStage[s.id] = []
  })
  data?.forEach((lead: any) => {
    const currentStatus = lead.status || 'new'
    if (leadsByStage[currentStatus]) {
      leadsByStage[currentStatus].push(lead)
    } else {
      leadsByStage['new'].push(lead)
    }
  })

  return (
    <div className="p-4 lg:p-6 animate-fade-in space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales Pipeline</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Drag and drop deal cards to advance stages. Automations trigger automatically.
        </p>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((s) => (
            <div key={s.id} className="min-w-[240px]">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STAGES.map((stage) => (
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
