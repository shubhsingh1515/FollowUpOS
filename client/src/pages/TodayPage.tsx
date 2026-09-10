import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  TrendingDown, ShieldAlert, MessageSquare, Phone, Mail,
  Flame, ChevronRight, Check, Zap, ExternalLink, Calendar,
  Play, DollarSign, Bot
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function TodayPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [activeModalAction, setActiveModalAction] = useState<any | null>(null)

  // Fetch today priority data
  const { data: todayRes, isLoading } = useQuery({
    queryKey: ['today-priorities'],
    queryFn: async () => {
      const res = await api.get('/leads/priorities')
      return res.data.data.todayData || res.data.data
    },
    staleTime: 60000,
  })

  const todayData = todayRes || {
    greeting: `Good morning, ${user?.name?.split(' ')[0] || 'there'}!`,
    summaryText: "Here's what needs your sales attention right now.",
    stats: {
      urgentFollowUps: 4,
      revenueAtRisk: 450000,
      hotLeadsUncontacted: 3,
      meetingsToday: 2,
    },
    priorityActions: [],
    revenueAtRisk: [],
    leadDecay: [],
  }

  const handleCompleteAction = (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCompletedActions(prev =>
      prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Morning Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Sales Execution Mode
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {todayData.greeting}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {todayData.summaryText}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/copilot')}
            className="gap-2 text-xs"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            Ask Copilot
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/pipeline')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
          >
            View Pipeline
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 via-background to-background">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Priority Actions</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-foreground mt-2">
              {todayData.priorityActions?.length || 4}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">
                {completedActions.length} completed
              </span>{' '}
              today
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50/40 via-background to-background">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Revenue At Risk</span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">
              {formatCurrency(todayData.stats?.revenueAtRisk || 450000, 'INR')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              2 high-value leads with no contact in 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Hot Leads Waiting</span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
            <div className="text-3xl font-extrabold text-foreground mt-2">
              {todayData.stats?.hotLeadsUncontacted || 3}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Average response target: &lt; 15 mins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Scheduled Calls</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-foreground mt-2">
              {todayData.stats?.meetingsToday || 2}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Next meeting: 11:30 AM (TechStartup)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Execution Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Ranked Action Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                Your Priority Action Queue
              </h2>
              <Badge variant="outline" className="text-xs font-mono">
                AI Ranked
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {completedActions.length} of {todayData.priorityActions?.length || 4} done
            </span>
          </div>

          <div className="space-y-3">
            {(todayData.priorityActions || []).map((action: any, idx: number) => {
              const isDone = completedActions.includes(action.id)
              return (
                <div
                  key={action.id || idx}
                  onClick={() => navigate(`/leads/${action.leadId}`)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isDone
                      ? 'bg-muted/40 border-border/50 opacity-60'
                      : 'bg-card border-border hover:border-indigo-500/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Checkbox circle */}
                    <button
                      onClick={(e) => handleCompleteAction(action.id, e)}
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-muted-foreground/40 hover:border-indigo-600'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {action.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({action.company})
                          </span>
                          <Badge
                            className={`text-[9px] uppercase px-1.5 py-0 ${
                              action.channel === 'whatsapp'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {action.channel}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-foreground">
                            {formatCurrency(action.dealValue, 'INR')}
                          </span>
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            Priority: {action.priorityScore}/100
                          </Badge>
                        </div>
                      </div>

                      <h3 className={`text-xs font-medium mt-1 text-foreground ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                        {action.title}
                      </h3>

                      <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong className="text-foreground">Why now:</strong> {action.aiReason}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 text-xs">
                        <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {action.dueIn}
                        </span>

                        <Button
                          size="sm"
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 px-3 shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/leads/${action.leadId}`)
                          }}
                        >
                          <span>{action.suggestedAction}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right 4 Cols: Intelligence & Decay Watch */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue at Risk Panel */}
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Revenue At Risk
              </CardTitle>
              <CardDescription className="text-xs text-amber-800/80 dark:text-amber-300/80">
                High-ticket deals slowing down in the sales cycle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(todayData.revenueAtRisk || []).map((risk: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/leads/${risk.leadId}`)}
                  className="p-3 rounded-lg border bg-background/80 hover:bg-background cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{risk.name}</span>
                    <span className="font-bold text-amber-600">
                      {formatCurrency(risk.value, 'INR')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{risk.reason}</p>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium pt-1 flex items-center gap-1">
                    Review opportunity <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lead Decay Detector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                Lead Decay Detector
              </CardTitle>
              <CardDescription className="text-xs">
                Inquiries turning cold from response delays.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(todayData.leadDecay || []).map((decay: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/leads/${decay.leadId}`)}
                  className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{decay.name}</span>
                    <Badge variant="destructive" className="text-[9px]">
                      Silent {decay.daysSilent} days
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{decay.recommended}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7 mt-1 text-indigo-600 hover:text-indigo-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/leads/${decay.leadId}`)
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" /> Generate Revival Message
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
