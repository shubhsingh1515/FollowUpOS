import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users, Flame, Calendar, TrendingUp, Trophy, BarChart,
  ArrowUpRight, MessageSquare, ChevronRight, Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, getInitials, temperatureLabel, timeAgo, cn } from '@/lib/utils'
import api from '@/lib/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

function KPICard({
  title, value, subtitle, icon: Icon, iconColor, trend, loading,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  trend?: number
  loading?: boolean
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{title}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
                {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              </div>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconColor)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            {trend !== undefined && (
              <div className={cn('flex items-center gap-1 mt-2 text-xs', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                <ArrowUpRight className={cn('w-3 h-3', trend < 0 && 'rotate-180')} />
                <span>{Math.abs(trend)}% vs last month</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export default function DashboardPage() {
  const { user, organization } = useAuthStore()

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/overview')
      return data.data
    },
    refetchInterval: 60000,
  })

  const { data: priorities, isLoading: prioritiesLoading } = useQuery({
    queryKey: ['leads', 'priorities'],
    queryFn: async () => {
      const { data } = await api.get('/leads/priorities')
      return data.data.leads
    },
  })

  const { data: sourcesData } = useQuery({
    queryKey: ['analytics', 'sources'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/sources')
      return data.data
    },
  })

  const { data: trendData } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/trends?days=14')
      return data.data
    },
  })

  const currency = organization?.currency || 'INR'

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what's happening at {organization?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/leads/new">Add Lead</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/followups">
              <Calendar className="w-4 h-4 mr-1.5" />
              Follow-ups
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="New Leads"
          value={overview?.newLeads ?? '—'}
          subtitle="This month"
          icon={Users}
          iconColor="bg-indigo-100 text-indigo-600"
          loading={overviewLoading}
        />
        <KPICard
          title="Hot Leads"
          value={overview?.hotLeads ?? '—'}
          subtitle="Need attention"
          icon={Flame}
          iconColor="bg-red-100 text-red-600"
          loading={overviewLoading}
        />
        <KPICard
          title="Follow-ups Today"
          value={overview?.pendingFollowUps ?? '—'}
          subtitle={overview?.overdueFollowUps ? `${overview.overdueFollowUps} overdue` : ''}
          icon={Calendar}
          iconColor="bg-orange-100 text-orange-600"
          loading={overviewLoading}
        />
        <KPICard
          title="Pipeline Value"
          value={overview ? formatCurrency(overview.pipelineValue, currency) : '—'}
          subtitle="Active deals"
          icon={TrendingUp}
          iconColor="bg-green-100 text-green-600"
          loading={overviewLoading}
        />
        <KPICard
          title="Won Deals"
          value={overview?.wonDeals ?? '—'}
          subtitle={overview ? formatCurrency(overview.wonRevenue, currency) : ''}
          icon={Trophy}
          iconColor="bg-yellow-100 text-yellow-600"
          loading={overviewLoading}
        />
        <KPICard
          title="Conversion"
          value={overview ? `${overview.conversionRate}%` : '—'}
          subtitle="Win rate"
          icon={BarChart}
          iconColor="bg-purple-100 text-purple-600"
          loading={overviewLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Priorities */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Your Priorities Today
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/leads" className="text-xs">View all →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {prioritiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !priorities?.length ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="font-medium text-sm">No follow-ups today!</p>
                  <p className="text-xs text-muted-foreground mt-1">You're all caught up. Great work!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {priorities.slice(0, 6).map((lead: any) => {
                    const { icon, className: tempClass } = temperatureLabel(lead.leadTemperature)
                    const contact = lead.contactId
                    return (
                      <Link
                        key={lead._id}
                        to={`/leads/${lead._id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-accent/30 transition-all group"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className={cn('text-sm font-medium', lead.leadTemperature === 'hot' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}>
                            {getInitials(contact?.fullName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{contact?.fullName}</span>
                            <span className="text-sm">{icon}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground truncate">
                              {contact?.company} · {lead.service || lead.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', tempClass)}>
                              Score: {lead.leadScore}
                            </span>
                            {lead.isOverdue && (
                              <span className="text-xs text-red-600 font-medium">Overdue!</span>
                            )}
                            {lead.hasRecentReply && (
                              <span className="text-xs text-green-600 font-medium">Replied recently</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lead Sources */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Leads by Source</CardTitle>
            </CardHeader>
            <CardContent>
              {sourcesData?.length ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={sourcesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {sourcesData.map((_: any, index: number) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [v, 'Leads']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {sourcesData.slice(0, 5).map((s: any, i: number) => (
                      <div key={s.source} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs capitalize flex-1 truncate">{s.source.replace('_', ' ')}</span>
                        <span className="text-xs font-medium">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leads Trend Chart */}
      {trendData?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Lead Volume — Last 14 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Leads" stroke="#6366f1" strokeWidth={2} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="hotCount" name="Hot" stroke="#ef4444" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
